/* eslint-disable max-classes-per-file */
const ApplicationError = require('./BaseError');

class InputSchemaValidationError extends ApplicationError {
  constructor(ajvErrorOutput) {
    super(ajvErrorOutput, 409);
  }
}

class OtpGenerationMalformedRequestError extends ApplicationError {
  constructor() {
    super('The request body for OTP generation must contain either an email or a phone number', 400);
  }
}

class InvalidContactNumberError extends ApplicationError {
  constructor() {
    super('The phone number provided is not valid', 400);
  }
}

class InvalidGovSgEmailError extends ApplicationError {
  constructor() {
    super('The email provided is not a valid Gov SG email', 400);
  }
}

module.exports = {
  InputSchemaValidationError,
  OtpGenerationMalformedRequestError,
  InvalidContactNumberError,
  InvalidGovSgEmailError,
};
