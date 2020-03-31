const AWS = require('aws-sdk');
const _ = require('lodash');

// Error imports
const { UserNotFoundError } = require('../errors/UserErrors');
const { TABLE_ENV } = process.env;
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
      console.log(`Error finding ${contactNumber} in ${userTable} ${error}`);
    }
  }
  throw new UserNotFoundError(contactNumber);
}

module.exports = { findUser };
