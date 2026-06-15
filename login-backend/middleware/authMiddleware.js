const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Access denied — no token provided' });

  const token = header.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    if (!await User.findById(decoded.id))
      return res.status(401).json({ success: false, message: 'Token valid but user no longer exists' });

    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Token expired — please log in again'
      : 'Invalid token';
    return res.status(401).json({ success: false, message: msg });
  }
};

module.exports = { authenticate };
