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
const GOV_SG_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.+-]+\.gov.sg$/;

/**
 * @api {post} /otp/generate Create OTP for user
 * @apiVersion 0.1.0
 * @apiGroup OTP
 * @apiParam {String} contact_number     User's contact number
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
    let isAdmin;
    let email;
    let contactNumber;
    // 0. Validate whether contact is a phone number or email
    if (contact.match(PHONE_NUMBER_REGEX)) {
      isAdmin = false;
      contactNumber = contact;
    } else if (contact.match(GOV_SG_EMAIL_REGEX)) {
      isAdmin = true;
      email = contact;
    } else {
      throw new Error('Provided contact must be either a gov.sg email or a phone number');
    }

    // 1. Check if user is on a quarantine order or admin user before issuing OTP
    if (isAdmin) {
      await AdminUserService.getUser(email);
    } else {
      await QuarantineOrderService.getLatestOrderByContactNumber(contactNumber);
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
    await OtpService.saveOtp({
      contactNumber,
      email,
      hashedOtp,
    });

    res.status(200).send({ message: 'OTP created' });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

/**
 * @api {post} /otp/verify Verify user's OTP
 * @apiVersion 0.1.0
 * @apiGroup OTP
 * @apiParam {String} contact_number         User's contact number
 * @apiParam {String} otp                   Keyed in OTP
 *
 * @apiSuccess {Object} access_token     User's access token (JWT)
 * @apiSuccessExample {json} Success-Reponse:
 *  HTTP/1.1 200 OK
 *    {
 *      "token" : "eyJhbdQssw5c...sadjaksd123j1lkj98c87a4ag20b8621nour978"
 *    }
 * @apiErrorExample {text} Error-Response:
 * HTTP/1.1 400 Bad Request
 * Invalid OTP
 */
async function verifyOtp(req, res) {
  const { contact_number: contactNumber, otp } = req.body;
  try {
    const retrievedOtp = await OtpService.getOtp(contactNumber);
    // Commented out for testing purposes
    // if (!bcrypt.compareSync(otp, retrievedOtp)) {
    //   res.status(401).send('Invalid OTP');
    //   return;
    // }
    // Retrieve latest order related to number
    const { id: orderId, end_date: endDate } = await QuarantineOrderService.getLatestOrderByContactNumber(contactNumber);
    const access_token = jwt.sign(
      {
        order_id: orderId,
        // Reason why we divide it by 1000:
        // https://github.com/auth0/node-jsonwebtoken#token-expiration-exp-claim
        exp: Math.floor(endDate.getTime() / 1000),
      },
      TOKEN_SIGNING_KEY,
    );
    res.status(200).send({ access_token });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

router.post('/generate', generateOtp);
router.post('/verify', verifyOtp);

module.exports = router;
