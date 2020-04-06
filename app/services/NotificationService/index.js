// Firebase
const admin = require('firebase-admin');

const db = require('../../src/models');

const { PushNotificationNotFoundError } = require('../../errors/UserErrors');
const { PushNotificationSendError } = require('../../errors/PushNotificationErrors');
const { DbError } = require('../../errors/DbErrors');

// To use this applicationDefault() credential loading method,
// set GOOGLE_APPLICATION_CREDENTIALS to the path of the json credentials
// eg. export GOOGLE_APPLICATION_CREDENTIALS="./firebase-service-account.json"
process.env.GOOGLE_APPLICATION_CREDENTIALS = './app/services/NotificationService/firebase-service-account.json';
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const messaging = admin.messaging();

// Resources:
// https://firebase.google.com/docs/cloud-messaging/concept-options
// https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages

// Action indicator in data field of message
const ACTION = {
  GET_LOCATION: 'getLocation',
  GET_PHOTO: 'getPhoto',
  GET_HEALTH_REPORT: 'getHealthReport',
};

// Android app package name
const ANDROID_PACKAGE_NAME = 'sg.parking.streetsmart';

// https://firebase.google.com/docs/reference/admin/node/TokenMessage.html
// This is a TokenMessage set with our defaults
const DEFAULT_MESSAGE = {
  token: null, // Set to fcmToken
  android: {
    priority: 'high',
    // Set to how long parking command would still be rewlevant
    // Currently 5 mins
    ttl: 60 * 60 * 1000, // milliseconds (60 minutes)
    restrictedPackageName: ANDROID_PACKAGE_NAME, // This ensures message is only sent to this app
    // collapseKey serves as an identifier for a group of messages that can be collapsed
    // so that only the last message gets sent when delivery can be resumed.
    // A maximum of four different collapse keys may be active at any given time.
    // https://firebase.google.com/docs/reference/admin/node/admin.messaging.AndroidConfig.html#optional-collapse-key
    collapseKey: 'singaporeGovernment',
  },
  data: {
    action: null, // [ACTION.PARK, ACTION.STOP] Driver app will use this to decide what to do
  },
};

async function getPushNotificationForOrderId(orderId) {
  try {
    const pn = await db.PushNotifications.findOne({ where: { order_id: orderId } });
    if (!pn) {
      throw new PushNotificationNotFoundError(orderId);
    }
    return pn;
  } catch (err) {
    throw new DbError(err);
  }
}

async function registerForPushNotification(orderId, pushNotificationId, platform) {
  try {
    // Get exiting push notification
    const pn = await db.PushNotifications.findOne({ order_id: orderId });

    if (pn) {
      // Update push notification
      return await pn.update({
        push_notification_id: pushNotificationId,
        platform,
      });
    }
    // Create new push notification
    return await db.PushNotifications.create({
      push_notification_id: pushNotificationId,
      platform,
      order_id: orderId,
    });
  } catch (err) {
    throw new DbError(err);
  }
}

// Returns promise on whether notification is passed to FCM successfully
async function sendGetLocationPingToDevice(pushNotificationId, platform) {
  const message = {
    ...DEFAULT_MESSAGE,
    notification: {
      title: 'Singapore Government',
      body: 'Click here to complete your location reporting',
    },
    token: pushNotificationId,
    data: {
      action: ACTION.GET_LOCATION,
    },
  };
  try {
    return await messaging.send(message);
  } catch (error) {
    throw new PushNotificationSendError(error);
  }
}

// Returns promise on whether notification is passed to FCM successfully
async function sendGetPhotoPingToDevice(pushNotificationId, platform) {
  const message = {
    ...DEFAULT_MESSAGE,
    notification: {
      title: 'Singapore Government',
      body: 'Click here to send a selfie for reporting',
    },
    token: pushNotificationId,
    data: {
      action: ACTION.GET_PHOTO,
    },
  };
  try {
    return await messaging.send(message);
  } catch (error) {
    throw new PushNotificationSendError(error);
  }
}

async function sendGetHealthReportPingToDevice(pushNotificationId, platform) {
  const message = {
    ...DEFAULT_MESSAGE,
    notification: {
      title: 'Singapore Government',
      body: 'Click here to submit your health report',
    },
    token: pushNotificationId,
    data: {
      action: ACTION.GET_HEALTH_REPORT,
    },
  };
  try {
    return await messaging.send(message);
  } catch (error) {
    throw new PushNotificationSendError(error);
  }
}

module.exports = {
  getPushNotificationForOrderId,
  registerForPushNotification,
  sendGetLocationPingToDevice,
  sendGetPhotoPingToDevice,
  sendGetHealthReportPingToDevice,
};
