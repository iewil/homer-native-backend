const ApplicationError = require('./BaseError');

class UserNotFoundError extends ApplicationError {
  constructor(contactNumber) {
    super(`User ${contactNumber} not found`, 404);
  }
}

module.exports = {
  UserNotFoundError,
};
