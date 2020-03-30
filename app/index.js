const express = require('express');
const AWS = require('aws-sdk');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { TABLE_ENV, PORT, TOKEN_SIGNING_KEY } = process.env;

const app = express();
app.use(express.json());

// Middlewares
const auth = require('./middlewares/auth');

// OTP crypto
const SALT_ROUNDS = 10;

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

async function createOTP(contactNumber) {
  // 1. Create OTP
  let otp;
  do {
    otp = crypto.randomBytes(3).toString('hex');
  }
  while (otp.match(/[a-z]/i));

  // TODO added this log so that I can see the OTP and test if verification works
  // hide the OTP when it goes into prod
  console.log('created OTP', otp, 'for contact: ', contactNumber);
  // 2. Save OTP
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const hashedOtp = bcrypt.hashSync(otp, salt);

  // 2.2 Create/Update OTP entry
  const updateParams = {
    TableName: HOMER_OTP_TABLE,
    Key: {
      contact_number: contactNumber,
    },
    UpdateExpression: 'set updated_time = :updatedTime, hashed_otp = :hashedOtp, salt = :salt, has_been_used = :hasBeenUsed',
    ExpressionAttributeValues: {
      ':hashedOtp': hashedOtp,
      ':updatedTime': new Date().getTime(),
      ':salt': salt,
      ':hasBeenUsed': false,
    },
  };

  try {
    await docClient.update(updateParams).promise();
  } catch (error) {
    throw new Error(`Error saving OTP to ${HOMER_OTP_TABLE}: ${error.message}`);
  }
}

async function checkOtpValidity(contactNumber, keyedInOtp) {
  const params = {
    TableName: HOMER_OTP_TABLE,
    Key: {
      contact_number: contactNumber,
    },
  };

  try {
    const { Item: otpItem } = await docClient.get(params).promise();
    // If entry doesn't exist
    if (_.isEmpty(otpItem)) {
      return false;
    }

    if (otpItem.has_been_used) {
      return false;
    }

    const keyedInOtpHash = bcrypt.hashSync(keyedInOtp, otpItem.salt);
    if (keyedInOtpHash !== otpItem.hashed_otp) {
      return false;
    }

    // check that it's within 15 minutes since OTP was generated
    const currentTime = new Date().getTime();
    if ((currentTime - otpItem.updated_time) / 1000 / 60 > 15) {
      return false;
    }

    return true;
  } catch (error) {
    throw new Error(`Error finding OTP in ${HOMER_OTP_TABLE}: ${error.message}`);
  }
}

async function invalidateOtp(contactNumber) {
  const updateParams = {
    TableName: HOMER_OTP_TABLE,
    Key: {
      contact_number: contactNumber,
    },
    UpdateExpression: 'set updated_time = :updatedTime, has_been_used = :hasBeenUsed',
    ExpressionAttributeValues: {
      ':updatedTime': new Date().getTime(),
      ':hasBeenUsed': true,
    },
  };

  try {
    await docClient.update(updateParams).promise();
    console.log(`OTP for ${contactNumber} invalidated`);
  } catch (error) {
    console.log(`Error invalidating ${contactNumber}'s OTP: ${error}`);
  }
}

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
    await createOTP(user.contactNumber);
    res.status(200).send('OTP successfully created');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error saving OTP');
  }

  // TODO send SMS of OTP
});

app.post('/otp/verify', async (req, res) => {
  const { contactNumber, otp } = req.body;
  try {
    const isValidOtp = await checkOtpValidity(contactNumber, otp);
    if (!isValidOtp) {
      res.status(400).send('Invalid OTP');
      return;
    }

    // invalidate OTP
    await invalidateOtp(contactNumber);

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
    console.log(`Error submitting ${contactNumber}'s location: ${error.message}`);
  }
});

app.listen(PORT, () => console.log(`Native Homer backend app listening on port ${PORT}`));

module.exports = app;
