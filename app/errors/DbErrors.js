const ApplicationError = require('./BaseError');

class DbError extends ApplicationError {
  constructor(err) {
    super(`A database error has occurred: ${err}`, 500);
  }
}

module.exports = {
  DbError,
};
