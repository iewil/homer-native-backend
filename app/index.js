const express = require('express');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const OTPManager = require('./helpers/otp');
const UserHelper = require('./helpers/user');

const { PORT, TOKEN_SIGNING_KEY } = process.env;

const app = express();
app.use(express.json());

// Middlewares
const auth = require('./middlewares/auth');

// DynamoDB constants
const HOMER_LOCATIONS_TABLE = 'homer-native-location';
const AWS_REGION_NAME = 'ap-southeast-1';
AWS.config.update({ region: AWS_REGION_NAME });
const docClient = new AWS.DynamoDB.DocumentClient();

// This wraps around request handlers so that any error
// is passed on to the general error handler
const withErrorHandler = (func) => (res, req, next) => {
  func(res, req).catch(next);
};
/**
 * @api {post} /otp Create OTP for user
 * @apiVersion 0.1.0
 * @apiGroup OTP
 * @apiParam {String} contactNumber     User's contact number
 *
 * @apiSuccessExample {text} Success-Reponse:
 *  HTTP/1.1 200 OK
 *  OTP Successfully created
 *
 * @apiErrorExample {text} Error-Response:
 * HTTP/1.1 404 Not Found
 * Number not found
 */
app.post('/otp', withErrorHandler(async (req, res) => {
  const { contactNumber } = req.body;
  // 1. Check if user exists in user tables
  const user = await UserHelper.findUser(contactNumber);

  // 2. Create entry with OTP Hash [number, agency, otp, time]
  await OTPManager.createOTP(user.contactNumber);
  res.status(200).send('OTP successfully created');
  // TODO send SMS of OTP
}));

/**
 * @api {post} /otp/verify Verify user's OTP
 * @apiVersion 0.1.0
 * @apiGroup OTP
 * @apiName Hello
 * @apiParam {String} contactNumber     User's contact number
 * @apiParam {String} otp               Keyed in OTP
 *
 * @apiSuccess {Object} token     User's session token which has their `contactNumber` in the payload (JWT)
 * @apiSuccessExample {json} Success-Reponse:
 *  HTTP/1.1 200 OK
 *    {
 *      "token" : "eyJhbdQssw5c...sadjaksd123j1lkj98c87a4ag20b8621nour978"
 *    }
 */
app.post('/otp/verify', withErrorHandler(async (req, res) => {
  const { contactNumber, otp } = req.body;
  await OTPManager.checkOtpValidity(contactNumber, otp);

  // invalidate OTP
  await OTPManager.invalidateOtp(contactNumber);

  // Issue JWT with contact number
  res.status(200).json({
    token: jwt.sign(
      { contactNumber },
      TOKEN_SIGNING_KEY,
      { expiresIn: '21 days' },
    ),
  });
}));

/**
 * @api {post} /location Submit user's location
 * @apiVersion 0.1.0
 * @apiGroup Location
 * @apiParam {String} longitude       User's longitude position
 * @apiParam {String} latitude        User's latitude position
 * @apiParam {Number} accuracy        position accuracy (in terms of m)
 *
 * @apiHeader {String} authorization  User's JWT
 * @apiHeaderExample {json} Header-Example:
 *  {
 *    "Authorization": "eyJhbdQssw5c...sadjaksd123j1lkj98c87a4ag20b8621nour978"
 *  }
 *
 * @apiSuccessExample {text} Success-Reponse:
 *  HTTP/1.1 200 OK
 *  Location submitted
 */
app.post('/location', auth, withErrorHandler(async (req, res) => {
  const { longitude, latitude, accuracy } = req.body;
  const { contactNumber } = req.user;
  const putParams = {
    Item: {
      contact_number: contactNumber,
      submitted_time: new Date().getTime(),
      data: { longitude, latitude, accuracy },
    },
    TableName: HOMER_LOCATIONS_TABLE,
  };
  try {
    await docClient.put(putParams).promise();
    res.status(200).send('Location submitted');
  } catch (error) {
    console.log(`Error submitting ${contactNumber}'s location: ${error.message}`);
  }
}));

const ApplicationError = require('./errors/BaseError');

app.use(async (err, req, res, next) => {
  if (err instanceof ApplicationError) {
    console.log(err.name, err.message);
    res.status(err.status).json({
      error: err.name,
      message: err.message,
    });
  } else {
    console.log('Unaccounted error: ', err.stack);
    res.status(500).json({
      error: 'Unexpected Server Error',
      message: 'An Unexpected error has occured',
    });
  }
});

app.listen(PORT, () => console.log(`Native Homer backend app listening on port ${PORT}`));

module.exports = app;
