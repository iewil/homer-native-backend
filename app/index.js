const express = require('express');
const AWS = require('aws-sdk');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// NODE_ENV is either `production` or `staging`
const { NODE_ENV, PORT } = process.env;

const app = express();
app.use(express.json());


// OTP crypto
const SALT_ROUNDS = 10;
const { OTP_SALT } = process.env;


// DynamoDB constants
const HOMER_OTP_TABLE = 'homer-native-otp';
const AWS_REGION_NAME = 'ap-southeast-1';
AWS.config.update({ region: AWS_REGION_NAME });
const docClient = new AWS.DynamoDB.DocumentClient();

// Agencies
const homerAgencies = ['mom-sho', 'ica-homer', 'moe-homer', 'mom-dloa', 'mom-fdw', 'mom-sho', 'homer'];

async function findUser(contactNumber) {
  // Searches the contact number in every agency's user table
  for (let i = 0; i < homerAgencies.length; i += 1) {
    const agency = homerAgencies[i];
    const userTable = `${agency}-users-${NODE_ENV}`;
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

  // 2. Save OTP
  const hashedOtp = bcrypt.hashSync(OTP_SALT, SALT_ROUNDS);
  const putParams = {
    Item: {
      contact_number: contactNumber,
      updated_time: new Date().getTime().toString(),
      hashed_otp: hashedOtp,
    },
    TableName: HOMER_OTP_TABLE,
  };

  try {
    await docClient.put(putParams).promise();
  } catch (error) {
    throw new Error(`Error saving OTP to ${HOMER_OTP_TABLE}: ${error.message}`);
  }
}

app.post('/otp', async (req, res) => {
  const { contactNumber } = req.body;
  // 1. Check if user exists in user tables
  const user = await findUser(contactNumber);
  if (!user) {
    res.status(404).send('Number not found');
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

app.post('/location', (req, res) => {
  res.send('Ok');
});

app.listen(PORT, () => console.log(`Native Homer backend app listening on port ${PORT}`));

module.exports = app;
