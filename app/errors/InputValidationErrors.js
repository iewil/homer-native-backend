const ApplicationError = require('./BaseError');

class InputSchemaValidationError extends ApplicationError {
  constructor(ajvErrorOutput) {
    super(ajvErrorOutput, 409)
  }
}

module.exports = {
  InputSchemaValidationError,
};
