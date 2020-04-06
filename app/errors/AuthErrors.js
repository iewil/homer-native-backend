const ApplicationError = require('./BaseError');

class InvalidAdminUserError extends ApplicationError {
  constructor() {
    super('The provided access token is invalid - only admin users allowed', 401);
  }
}

module.exports = {
  InvalidAdminUserError,
};
