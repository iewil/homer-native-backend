/* eslint-disable max-classes-per-file */
const ApplicationError = require('./BaseError');

class OTPSavingError extends ApplicationError {
  constructor(contactNumber) {
    super(`Error saving ${contactNumber}'s OTP`, 409);
  }
}

class OTPNotFoundError extends ApplicationError {
  constructor(contactNumber) {
    super(`OTP entry not found for ${contactNumber}`, 404);
  }
}

class OTPHasBeenUsedError extends ApplicationError {
  constructor(contactNumber) {
    super(`OTP has already been used for ${contactNumber}`, 409);
  }
}

class OTPExpiredError extends ApplicationError {
  constructor(contactNumber) {
    super(`OTP has expired for ${contactNumber}`, 409);
  }
}

class OTPInvalidError extends ApplicationError {
  constructor(contactNumber) {
    super(`OTP keyed in is invalid for ${contactNumber}`, 409);
  }
}

class OTPInvalidatingError extends ApplicationError {
  constructor(contactNumber) {
    super(`Error invalidating ${contactNumber}'s OTP`, 409);
  }
}

module.exports = {
  OTPSavingError,
  OTPNotFoundError,
  OTPHasBeenUsedError,
  OTPExpiredError,
  OTPInvalidError,
  OTPInvalidatingError,
};
