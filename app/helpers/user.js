const AWS = require('aws-sdk');
const _ = require('lodash');

const { HOMER_NATIVE_USERS_TABLE, ALL_HOMER_USERS_TABLE } = require('../db');
// Error imports
const { UserNotFoundError } = require('../errors/UserErrors');

const AWS_REGION_NAME = 'ap-southeast-1';
AWS.config.update({ region: AWS_REGION_NAME });
const docClient = new AWS.DynamoDB.DocumentClient();

/**
 * This goes through every users table under the Homer SMS system to find
 * if the users' contact number is in any of the tables
 * @param {String} contactNumber User's contact number
 * @returns {Object}  user                 user info
 * @returns {String}  user.contactNumber   user's contactNumer
 * @returns {String}  user.agency          agency enforcing user's SHN
 *
 * ### Why users are stored in multiple tables
 * The SMS system groups users based on the agency that enforces their Stay-Home Notice (SHN),
 * and the tables are named accordingly
 * (e.g the `ica-homer-users-production` table stores users who's SHNs are enforced by ICA)
 */
async function findUser(contactNumber) {
  // TODO we can actually use `transactGet` instead - https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#transactGet-property
  for (let i = 0; i < ALL_HOMER_USERS_TABLE.length; i += 1) {
    const userTable = ALL_HOMER_USERS_TABLE[i];
    const params = {
      TableName: userTable,
      Key: {
        contact_number: contactNumber,
      },
    };
    try {
      const result = await docClient.get(params).promise();
      if (!_.isEmpty(result)) {
        // If we found the user's record in our native app users table, the agency that's
        // enforcing the user's SHN is already stored alongside their contact number (`agency`),
        // so we can just retrieve the agency info from the entry we found
        if (userTable === HOMER_NATIVE_USERS_TABLE) {
          return { contactNumber, agency: result.Item.agency };
        }

        // This is to find the agency prefix of the table
        // (i.e get `ica-homer` from `ica-homer-users-staging`)
        // so we can keep track of which agency is enforcing the person's SHN compliance
        const agency = userTable.slice(0, userTable.indexOf('users') - 1);
        return { contactNumber, agency };
      }
    } catch (error) {
      console.log(`AWS error finding ${contactNumber} in ${userTable} ${error}`);
    }
  }
  throw new UserNotFoundError(contactNumber);
}

/**
 * We store users who migrate from the SMS system to the native app
 * in a new table (`homer-native-user-<table_env>`).
 * The important things we store in that table is:
 * - User's contact number
 * - agency that's enforcing their SHN
 * - Other info (i.e push notification token, etc.)
 *
 * This was done so it's easier to find the user compared to going through multiple users tables
 * and we also needed to store their device's push notification token as well
 */
async function registerUser({ contactNumber, agency, pushNotificationToken }) {
  const updateParams = {
    TableName: HOMER_NATIVE_USERS_TABLE,
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
