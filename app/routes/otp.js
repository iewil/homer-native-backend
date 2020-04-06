// Imports
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Ajv = require('ajv');

// Setup services
const ajv = new Ajv();
const router = express.Router();
const OtpService = require('../services/OtpService');
const QuarantineOrderService = require('../services/QuarantineOrderService');
const AdminUserService = require('../services/AdminUserService');

// Errors
const {
  InputSchemaValidationError,
  OtpGenerationMalformedRequestError,
  InvalidContactNumberError,
  InvalidGovSgEmailError,
} = require('../errors/InputValidationErrors');

// Validation schema
const {
  generateOtpSchema,
  verifyOtpSchema,
} = require('../validators/otp');


// Constants
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

const validateEmail = async (email) => {
  const result = email.match(GOV_SG_EMAIL_REGEX);
  if (!result) {
    throw new InvalidGovSgEmailError();
  }

  // Verify that email provided is a valid user
  await AdminUserService.getUser(email);
};

const validateContactNumber = async (contactNumber) => {
  const result = contactNumber.match(PHONE_NUMBER_REGEX);
  if (!result) {
    throw new InvalidContactNumberError();
  }

  // Verify that contact number provided has a valid quarantine order
  await QuarantineOrderService.getLatestOrderByContactNumber(contactNumber);
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
  const { contact_number: contactNumber, email } = req.body;
  try {
    // 0. Validate request
    const validRequest = ajv.validate(generateOtpSchema, req);
    if (!validRequest) throw new InputSchemaValidationError(JSON.stringify(ajv.errors));

    // 1. Validate email or contact number
    if (contactNumber) {
      await validateContactNumber(contactNumber);
    } else if (email) {
      await validateEmail(email);
    } else {
      throw new OtpGenerationMalformedRequestError();
    }

    // 2. Generate OTP
    let otp;
    do {
      otp = crypto.randomBytes(3).toString('hex');
    }
    while (otp.match(/[a-z]/i));

    const contact = email || contactNumber;
    console.log(`Generated OTP ${otp} for ${contact}`);

    const hashedOtp = bcrypt.hashSync(otp, SALT_ROUNDS);

    // 3. Save OTP to table
    const newOTP = {
      contactNumber,
      email,
      hashedOtp,
    };

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
  const {
    contact_number: contactNumber,
    email,
    otp,
  } = req.body;
  try {
    // 0. Validate request
    const validRequest = ajv.validate(verifyOtpSchema, req);
    if (!validRequest) throw new InputSchemaValidationError(JSON.stringify(ajv.errors));

    // 1. Validate email or contact number
    if (contactNumber) {
      await validateContactNumber(contactNumber);
    } else if (email) {
      await validateEmail(email);
    } else {
      throw new OtpGenerationMalformedRequestError();
    }

    // 2. Retrieve the OTP
    const retrievedOtp = await OtpService.getOtp(contactNumber, email);
    if (!bcrypt.compareSync(otp, retrievedOtp)) {
      res.status(401).send('Invalid OTP');
      return;
    }

    const contact = email || contactNumber;
    console.log(`Verified OTP ${otp} for ${contact}`);

    // 3. If quarantine order, retrieve latest order linked to phone number
    // and assign orderId and user role to the access token.
    // If admin user, just assign the role admin.
    let accessTokenParams;
    if (email) {
      const adminExpiry = new Date();
      adminExpiry.setDate(adminExpiry.getDate() + ADMIN_USER_TOKEN_EXPIRY);
      accessTokenParams = {
        role: 'admin',
        email,
        exp: (adminExpiry / 1000), // expiry of JWT in seconds
      };
    } else if (contactNumber) {
      const {
        id: orderId,
        end_date: endDate,
      } = await QuarantineOrderService.getLatestOrderByContactNumber(contactNumber);
      accessTokenParams = {
        role: 'user',
        order_id: orderId,
        // Reason why we divide it by 1000:
        // https://github.com/auth0/node-jsonwebtoken#token-expiration-exp-claim
        exp: Math.floor(endDate.getTime() / 1000),
      };
    }

    // 4. Sign the access token
    const accessToken = jwt.sign(accessTokenParams, TOKEN_SIGNING_KEY);
    res.status(200).send({ access_token: accessToken });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

router.post('/generate', generateOtp);
router.post('/verify', verifyOtp);

module.exports = router;
