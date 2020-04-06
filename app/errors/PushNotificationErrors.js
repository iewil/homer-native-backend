const ApplicationError = require('./BaseError');

class PushNotificationSendError extends ApplicationError {
  constructor(error) {
    super(`An error occured while sending the push notification: ${error}`, 500);
  }
}

module.exports = {
  PushNotificationSendError,
};
