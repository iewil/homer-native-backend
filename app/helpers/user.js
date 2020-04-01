const AWS = require('aws-sdk');
const _ = require('lodash');

// Error imports
const { UserNotFoundError } = require('../errors/UserErrors');

const { TABLE_ENV } = process.env;
const AWS_REGION_NAME = 'ap-southeast-1';
AWS.config.update({ region: AWS_REGION_NAME });
const docClient = new AWS.DynamoDB.DocumentClient();

// Agencies
const homerAgencies = ['homer-native', 'mom-sho', 'ica-homer', 'moe-homer', 'mom-dloa', 'mom-fdw', 'mom-sho', 'homer'];

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
      if (!_.isEmpty(result)) {
        if (agency === 'homer-native') {
          return { contactNumber, agency: result.Item.agency };
        }
        return { contactNumber, agency };
      }
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        console.log(`${userTable} is non-existent during search with ${contactNumber}`);
      } else {
        console.log(`AWS error finding ${contactNumber} in ${userTable} ${error}`);
      }
    }
  }
  throw new UserNotFoundError(contactNumber);
}

async function registerUser({ contactNumber, agency, pushNotificationToken }) {
  const updateParams = {
    // TODO change to use env var instead of hardcoded string
    TableName: 'homer-native-users-staging',
    Key: {
      contact_number: contactNumber,
    },
    UpdateExpression: 'set agency = :agency, push_notification_token = :pushNotificationToken',
    ExpressionAttributeValues: {
      ':agency': agency,
      ':pushNotificationToken': pushNotificationToken,
    },
  };
  try {
    await docClient.update(updateParams).promise();
  } catch (error) {
    throw new Error(`Error registering user: ${error}\n Update params: ${JSON.stringify(updateParams)}`);
  }
}

module.exports = { findUser, registerUser };
