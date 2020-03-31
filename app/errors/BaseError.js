class ApplicationError extends Error {
  constructor(message, status) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.status = status || 500;
    this.message = message || 'Something went wrong';
  }
}

module.exports = ApplicationError;
