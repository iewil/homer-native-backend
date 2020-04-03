const jwt = require('jsonwebtoken');

const { TOKEN_SIGNING_KEY } = process.env;

function verifyJwt(req, res, next) {
  let authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.status(401).send('Unauthorized');
  }

  // Remove 'Bearer '
  let signedToken = authorization.slice(7);

  try {
    const orderId = jwt.verify(signedToken, TOKEN_SIGNING_KEY);
    req.orderId = orderId;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).send('Token expired');
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(400).send('Malformed JWT');
      return;
    }

    console.error('Error authenticating', err, JSON.stringify(req.headers));
    res.status(500).send('Unhandled auth middleware error, check logs');
  }
}

module.exports = { verifyJwt };