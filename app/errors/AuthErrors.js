const ApplicationError = require('./BaseError');

class InvalidAdminUserError extends ApplicationError {
  constructor() {
    super('The provided access token is invalid - only admin users allowed', 401);
  }
}

class UnauthorisedActionError extends ApplicationError {
  constructor(action, resource) {
    super(`This user is not allowed to ${action} for ${resource}`, 401);
  }
}

module.exports = {
  InvalidAdminUserError,
  UnauthorisedActionError
};
