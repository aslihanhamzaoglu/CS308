const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  // Get token from Authorization header
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];  // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  // Verify token
  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Attach user information to request object
    req.user = user;
    next(); // Call the next middleware or route handler
  });
};

module.exports = authenticateJWT;
