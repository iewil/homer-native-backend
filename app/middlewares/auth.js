const jwt = require('jsonwebtoken');

const { TOKEN_SIGNING_KEY } = process.env;

function verifyJwt(req, res, next) {
  let authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized');
  }

  // Remove 'Bearer '
  let signedToken = authorization.slice(7);

  try {
    const orderId = jwt.verify(signedToken, TOKEN_SIGNING_KEY);
    req.orderId = orderId;
    next();
  } catch (err) {
    console.error('Error authenticating', err, JSON.stringify(req.headers));

    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).send('Token expired')
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(400).send('Malformed JWT')
    }
  }
}

module.exports = { verifyJwt };