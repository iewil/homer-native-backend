const ApplicationError = require('./BaseError');

class UserNotFoundError extends ApplicationError {
  constructor(contactNumber) {
    super(`User ${contactNumber} not found`, 404);
  }
}

class PushNotificationNotFoundError extends ApplicationError {
  constructor(orderId) {
    super(`Push notification id not found for Order ${orderId}`, 404);
  }
}

module.exports = {
  UserNotFoundError,
  PushNotificationNotFoundError,
};
