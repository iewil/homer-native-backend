const jwt = require('jsonwebtoken');

const { TOKEN_SIGNING_KEY } = process.env;

function checkToken(req, res, next) {
  let signedToken = req.headers.authorization;

  if (!signedToken || !signedToken.startsWith('Bearer ')) {
    res.status(401).send('Unauthorized');
  }

  // Remove 'Bearer '
  signedToken = signedToken.slice(7);

  try {
    const user = jwt.verify(signedToken, TOKEN_SIGNING_KEY);
    req.user = user;
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

    console.log('Error authenticating', err, JSON.stringify(req.headers));
    res.status(500).send('Unhandled error, check logs');
  }
}

module.exports = checkToken;
