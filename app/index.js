const express = require('express');
const AWS = require('aws-sdk');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const OTPManager = require('./helpers/otp');

const { TABLE_ENV, PORT, TOKEN_SIGNING_KEY } = process.env;

const app = express();
app.use(express.json());

// Middlewares
const auth = require('./middlewares/auth');

// DynamoDB constants
const HOMER_OTP_TABLE = 'homer-native-otp';
const HOMER_LOCATIONS_TABLE = 'homer-native-location';
const AWS_REGION_NAME = 'ap-southeast-1';
AWS.config.update({ region: AWS_REGION_NAME });
const docClient = new AWS.DynamoDB.DocumentClient();

// Agencies
const homerAgencies = ['mom-sho', 'ica-homer', 'moe-homer', 'mom-dloa', 'mom-fdw', 'mom-sho', 'homer'];

async function findUser(contactNumber) {
  // Searches the contact number in every agency's user table
  // TODO we can actually use `transactGet` instead - https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#transactGet-property
  for (let i = 0; i < homerAgencies.length; i += 1) {
    const agency = homerAgencies[i];
    const userTable = `${agency}-users-${TABLE_ENV}`;
    const params = {
      TableName: userTable,
      Key: {
        contact_number: contactNumber,
      },
    };
    try {
      const result = await docClient.get(params).promise();
      if (!_.isEmpty(result)) return { contactNumber, agency };
    } catch (error) {
      console.log(`Error finding ${contactNumber} in ${userTable}: ${error.message}`);
    }
  }
  return null;
}

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
app.post('/otp', async (req, res) => {
  const { contactNumber } = req.body;
  // 1. Check if user exists in user tables
  const user = await findUser(contactNumber);
  if (!user) {
    res.status(404).send('Number not found');
    return;
  }

  // 2. Create entry with OTP Hash [number, agency, otp, time]
  try {
    await OTPManager.createOTP(user.contactNumber);
    res.status(200).send('OTP successfully created');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error saving OTP');
  }

  // TODO send SMS of OTP
});

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
app.post('/otp/verify', async (req, res) => {
  const { contactNumber, otp } = req.body;
  try {
    const isValidOtp = await OTPManager.checkOtpValidity(contactNumber, otp);
    // TODO give detailed error as to why otp was invalid
    if (!isValidOtp) {
      res.status(400).send('Invalid OTP');
      return;
    }

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
  } catch (error) {
    console.log(error);
  }
});

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
app.post('/location', auth, async (req, res) => {
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
    res.status(500).send('Location submitted');
    console.log(`Error submitting ${contactNumber}'s location: ${error.message}`);
  }
});

app.listen(PORT, () => console.log(`Native Homer backend app listening on port ${PORT}`));

module.exports = app;
