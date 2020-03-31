const ApplicationError = require('./BaseError');

class LocationSavingError extends ApplicationError {
  constructor(contactNumber) {
    super(`Error saving ${contactNumber}'s location`, 500);
  }
}

module.exports = {
  LocationSavingError,
};
