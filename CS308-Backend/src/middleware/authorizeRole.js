const jwt = require('jsonwebtoken');

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      let token;

      // Check Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }

      // Fallback: check body (for testing purposes)
      if (!token && req.body?.token) {
        token = req.body.token;
      }

      if (!token) {
        return res.status(401).json({ message: 'Authorization token required' });
      }

      const decoded = jwt.verify(token, 'your_jwt_secret'); // or process.env.JWT_SECRET

      if (!decoded.role || !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};

module.exports = authorizeRole;
