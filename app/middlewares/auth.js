// Imports
const jwt = require('jsonwebtoken');

// Errors
const { InvalidAdminUserError } = require('../errors/AuthErrors');

// Constants
const { TOKEN_SIGNING_KEY } = process.env;

const adminOnlyRoute = ['/orders']

function verifyJwt (req, res, next) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized');
  }

  // Remove 'Bearer ' from authorization header
  const signedToken = authorization.slice(7);

  // Extract baseUrl from req
  // Express req.baseUrl is not available in middleware
  const startIdx = 0
  let endIdx = startIdx + 1
  while (req.originalUrl[endIdx] !== '/' && endIdx < req.originalUrl.length) {
    endIdx++
  }
  req.baseUrl = req.originalUrl.slice(startIdx, endIdx)

  const isAdminOnlyPath = adminOnlyRoute.includes(req.baseUrl)

  try {
    const tokenData = jwt.verify(signedToken, TOKEN_SIGNING_KEY);
    if (isAdminOnlyPath) {
      if (tokenData.role !== 'admin') {
        throw new InvalidAdminUserError();
      }
    } else {
      const { order_id: orderId, role} = tokenData;
      req.orderId = orderId;
      req.role = role;
    }
    next();
  } catch (err) {
    console.error('Error authenticating', err, JSON.stringify(req.headers));

    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).send('Token expired');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).send(`Unauthorized. ${err.message}`);
    }
    if (err instanceof InvalidAdminUserError) {
      return res.status(err.status).send(err.message);
    }
  }
};

module.exports = { verifyJwt };
