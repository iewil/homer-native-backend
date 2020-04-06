const registerPushNotificationSchema = {
  type: 'object',
  required: [
    'push_notification_id',
    'platform',
  ],
  additionalProperties: false,
  properties: {
    push_notification_id: {
      type: 'string',
    },
    platform: {
      type: 'string',
      enum: [
        'ios',
        'android',
      ],
    },
  },
};

const sendPushNotificationSchema = {
  type: 'object',
  required: [
    'order_id',
  ],
  additionalProperties: false,
  properties: {
    order_id: {
      type: 'string',
    },
  },
};

module.exports = {
  registerPushNotificationSchema,
  sendPushNotificationSchema,
};
