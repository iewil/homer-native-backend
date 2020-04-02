const AWS = require('aws-sdk');
const { LocationSavingError } = require('../errors/LocationErrors');
const { HOMER_NATIVE_LOCATIONS_TABLE } = require('../db');

const AWS_REGION_NAME = 'ap-southeast-1';
AWS.config.update({ region: AWS_REGION_NAME });
const docClient = new AWS.DynamoDB.DocumentClient();

async function saveLocation({
  longitude, latitude, accuracy, contactNumber,
}) {
  const putParams = {
    Item: {
      contact_number: contactNumber,
      submitted_time: new Date().getTime(),
      data: { longitude, latitude, accuracy },
    },
    TableName: HOMER_NATIVE_LOCATIONS_TABLE,
  };
  try {
    await docClient.put(putParams).promise();
  } catch (error) {
    console.log(`Error submitting ${contactNumber}'s location: ${error.message}\nputParams: ${JSON.stringify(putParams)}`);
    throw new LocationSavingError(contactNumber);
  }
}

module.exports = { saveLocation };
