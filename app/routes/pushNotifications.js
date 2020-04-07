// Imports
const express = require('express');

const router = express.Router();

// Validators
const Ajv = require('ajv');

const ajv = new Ajv();
const { registerPushNotificationSchema, sendPushNotificationSchema } = require('../validators/pushNotifications');

// Notification service
const {
  registerForPushNotification,
  getPushNotificationForOrderId,
  sendGetLocationPingToDevice,
  sendGetPhotoPingToDevice,
  sendGetHealthReportPingToDevice,
} = require('../services/NotificationService');

// Errors
const { InputSchemaValidationError } = require('../errors/InputValidationErrors');


async function handleRegister(request, response) {
  try {
    console.log('request to register push notification', request.body, request.orderId);

    // get body of POST request
    const { body, orderId } = request;

    // validate request
    const validRequest = ajv.validate(registerPushNotificationSchema, body);
    if (!validRequest) {
      throw new InputSchemaValidationError(JSON.stringify(ajv.errors));
    }

    const { push_notification_id: pushNotificationId, platform } = body;

    const status = await registerForPushNotification(orderId, pushNotificationId, platform);

    return response.status(200).json({ status });
  } catch (error) {
    return response.status(error.status).send(error.message);
  }
}

async function handlePingLocation(request, response) {
  try {
    console.log('request to ping location', request.body);

    // get body of POST request
    const { body } = request;

    // validate request
    const validRequest = ajv.validate(sendPushNotificationSchema, body);
    if (!validRequest) {
      throw new InputSchemaValidationError(JSON.stringify(ajv.errors));
    }

    const { order_id: orderId } = body;

    const pn = await getPushNotificationForOrderId(orderId);

    await sendGetLocationPingToDevice(pn.push_notification_id, pn.platform);

    return response.status(202).json({
      message: 'Ping location request sent to Homer app',
    });
  } catch (error) {
    return response.status(error.status).send(error.message);
  }
}

async function handlePingPhoto(request, response) {
  try {
    console.log('request to ping photo', request.body);

    // get body of POST request
    const { body } = request;

    // validate request
    const validRequest = ajv.validate(sendPushNotificationSchema, body);
    if (!validRequest) {
      throw new InputSchemaValidationError(JSON.stringify(ajv.errors));
    }

    const { order_id: orderId } = body;

    const pn = await getPushNotificationForOrderId(orderId);

    await sendGetPhotoPingToDevice(pn.push_notification_id, pn.platform);

    return response.status(202).json({
      message: 'Ping photo request sent to Homer app',
    });
  } catch (error) {
    return response.status(error.status).send(error.message);
  }
}

async function handlePingHealthReport(request, response) {
  try {
    console.log('request to ping health report', request.body);

    // get body of POST request
    const { body } = request;

    // validate request
    const validRequest = ajv.validate(sendPushNotificationSchema, body);
    if (!validRequest) {
      throw new InputSchemaValidationError(JSON.stringify(ajv.errors));
    }

    const { order_id: orderId } = body;

    const pn = await getPushNotificationForOrderId(orderId);

    await sendGetHealthReportPingToDevice(pn.push_notification_id, pn.platform);

    return response.status(202).json({
      message: 'Ping health report request sent to Homer app',
    });
  } catch (error) {
    return response.status(error.status).send(error.message);
  }
}

router.post('/register', handleRegister);
router.post('/location', handlePingLocation);
router.post('/photo', handlePingPhoto);
router.post('/health-report', handlePingHealthReport);

module.exports = router;
