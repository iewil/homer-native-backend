const bcrypt = require('bcrypt');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const _ = require('lodash');

// Error imports
const {
  OTPSavingError,
  OTPNotFoundError,
  OTPHasBeenUsedError,
  OTPExpiredError,
  OTPInvalidError,
  OTPInvalidatingError,
} = require('../errors/OtpErrors');
// OTP crypto
const SALT_ROUNDS = 10;

const HOMER_OTP_TABLE = 'homer-native-otp';
const AWS_REGION_NAME = 'ap-southeast-1';
AWS.config.update({ region: AWS_REGION_NAME });
const docClient = new AWS.DynamoDB.DocumentClient();

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
    console.log('Error saving OTP', error);
    throw new OTPSavingError(contactNumber);
  }
}

async function checkOtpValidity(contactNumber, keyedInOtp) {
  const params = {
    TableName: HOMER_OTP_TABLE,
    Key: {
      contact_number: contactNumber,
    },
  };

  const { Item: otpItem } = await docClient.get(params).promise();
  // If entry doesn't exist
  if (_.isEmpty(otpItem)) {
    throw new OTPNotFoundError(contactNumber);
  }
  // Check that it's within 15 minutes since OTP was generated
  const currentTime = new Date().getTime();
  if ((currentTime - otpItem.updated_time) / 1000 / 60 > 15) {
    throw new OTPExpiredError(contactNumber);
  }

  const keyedInOtpHash = bcrypt.hashSync(keyedInOtp, otpItem.salt);
  if (keyedInOtpHash !== otpItem.hashed_otp) {
    throw new OTPInvalidError(contactNumber);
  }

  if (otpItem.has_been_used) {
    throw new OTPHasBeenUsedError(contactNumber);
  }

  return true;
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
    throw new OTPInvalidatingError(contactNumber);
  }
}

module.exports = { invalidateOtp, createOTP, checkOtpValidity };
