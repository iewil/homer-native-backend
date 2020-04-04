// Imports
const jwt = require('jsonwebtoken');

// Errors
const { InvalidAdminUserError } = require('../errors/AuthErrors');

// Constants
const { TOKEN_SIGNING_KEY } = process.env;

function verifyJwt(isAdmin = false) {
  // eslint-disable-next-line consistent-return
  const verifyJwtMiddleware = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).send('Unauthorized');
    }

    // Remove 'Bearer ' from authorization header
    const signedToken = authorization.slice(7);


    try {
      const tokenData = jwt.verify(signedToken, TOKEN_SIGNING_KEY);
      if (isAdmin) {
        if (tokenData.role !== 'admint') {
          throw new InvalidAdminUserError();
        }
      } else {
        const { order_id: orderId } = tokenData;
        req.orderId = orderId;
      }
      next();
    } catch (err) {
      console.error('Error authenticating', err, JSON.stringify(req.headers));

      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).send('Token expired');
      }
      if (err instanceof jwt.JsonWebTokenError) {
        return res.status(400).send('Malformed JWT');
      }
      if (err instanceof InvalidAdminUserError) {
        return res.status(err.status).send(err.message);
      }
    }
  };

  return verifyJwtMiddleware;
}

module.exports = { verifyJwt };
