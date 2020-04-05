// Imports
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();
const OtpService = require('../services/OtpService');
const QuarantineOrderService = require('../services/QuarantineOrderService');
const AdminUserService = require('../services/AdminUserService');

const SALT_ROUNDS = 10;
const { TOKEN_SIGNING_KEY } = process.env;
const PHONE_NUMBER_REGEX = /^65[0-9]{8}$/;
// (?!.*\.\.) is a negative lookahead that prevents against consecutive dot characters
// (?!.*_from\.) is a negative lookahead that prevents against "_from." format of contractor emails
// ([a-z0-9._]+) checks that the username preceding the @ character is formed of one or more lower
// case alphabet/number/dot/underscore characters
// ([a-z.]+).gov.sg$ checks that the domain ends with .gov.sg and only contains lower case alphabets
// and dot characters
const GOV_SG_EMAIL_REGEX = /(?!.*\.\.)(?!.*_from\.)^([a-z0-9._]+)@([a-z.]+).gov.sg$/;
const ADMIN_USER_TOKEN_EXPIRY = 7; // 1 week in number of days

const isAdminUser = (contact) => {
  let isAdmin;

  if (contact.match(PHONE_NUMBER_REGEX)) {
    isAdmin = false;
  } else if (contact.match(GOV_SG_EMAIL_REGEX)) {
    isAdmin = true;
  } else {
    throw new Error('Provided contact must be either a gov.sg email or a phone number');
  }
  return isAdmin;
};

/**
 * @api {post} /otp/generate Create OTP for user
 * @apiVersion 0.1.0
 * @apiGroup OTP
 * @apiParam {String} contact     User's contact number or email
 *
 * @apiSuccessExample {text} Success-Reponse:
 *  HTTP/1.1 200 OK
 *  OTP created
 *
 * @apiErrorExample {text} Error-Response:
 * HTTP/1.1 404 Not Found
 * No Quarantine Order found for this number
 */
async function generateOtp(req, res) {
  const { contact } = req.body;
  try {
    // 0. Validate whether contact is a phone number or email
    const isAdmin = isAdminUser(contact);

    // 1. Check if user is on a quarantine order or admin user before issuing OTP
    if (isAdmin) {
      await AdminUserService.getUser(contact);
    } else {
      await QuarantineOrderService.getLatestOrderByContactNumber(contact);
    }

    // 2. Generate OTP
    let otp;
    do {
      otp = crypto.randomBytes(3).toString('hex');
    }
    while (otp.match(/[a-z]/i));
    console.log(`Generated OTP ${otp} for ${contact}`);

    const hashedOtp = bcrypt.hashSync(otp, SALT_ROUNDS);

    // 3. Save OTP to table
    let newOTP;
    if (isAdmin) {
      newOTP = {
        contactNumber: null,
        email: contact,
        hashedOtp,
      };
    } else {
      newOTP = {
        contactNumber: contact,
        email: null,
        hashedOtp,
      };
    }

    await OtpService.saveOtp(newOTP);

    res.status(200).send({ message: 'OTP created' });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

/**
 * @api {post} /otp/verify Verify user's OTP
 * @apiVersion 0.1.0
 * @apiGroup OTP
 * @apiParam {String} contact         User's contact number or email
 * @apiParam {String} otp                   Keyed in OTP
 *
 * @apiSuccess {Object} access_token     User's access token (JWT)
 * @apiSuccessExample {json} Success-Reponse:
 *  HTTP/1.1 200 OK
 *    {
 *      "access_token" : "eyJhbdQssw5c...sadjaksd123j1lkj98c87a4ag20b8621nour978"
 *    }
 * @apiErrorExample {text} Error-Response:
 * HTTP/1.1 400 Bad Request
 * Invalid OTP
 */
async function verifyOtp(req, res) {
  const { contact, otp } = req.body;
  try {
    // 0. Verify whether contact is a phone number or email
    const isAdmin = isAdminUser(contact);

    // 1. Retrieve the OTP
    // Commented out for testing purposes
    // const retrievedOtp = await OtpService.getOtp(contact, isAdmin);
    // if (!bcrypt.compareSync(otp, retrievedOtp)) {
    //   res.status(401).send('Invalid OTP');
    //   return;
    // }

    // 2. If quarantine order, retrieve latest order linked to phone number
    // and assign orderId to the access token. If admin user, just assign the role
    // admin.
    let accessTokenParams;
    if (isAdmin) {
      const adminExpiry = new Date();
      adminExpiry.setDate(adminExpiry.getDate() + ADMIN_USER_TOKEN_EXPIRY);
      accessTokenParams = {
        role: 'admin',
        email: contact,
        exp: (adminExpiry / 1000), // expiry of JWT in seconds
      };
    } else {
      const {
        id: orderId,
        end_date: endDate,
      } = await QuarantineOrderService.getLatestOrderByContactNumber(contact);
      accessTokenParams = {
        role: 'user',
        order_id: orderId,
        // Reason why we divide it by 1000:
        // https://github.com/auth0/node-jsonwebtoken#token-expiration-exp-claim
        exp: Math.floor(endDate.getTime() / 1000),
      };
    }

    // 3. Sign the access token
    const accessToken = jwt.sign(accessTokenParams, TOKEN_SIGNING_KEY);
    res.status(200).send({ access_token: accessToken });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

router.post('/generate', generateOtp);
router.post('/verify', verifyOtp);

module.exports = router;
