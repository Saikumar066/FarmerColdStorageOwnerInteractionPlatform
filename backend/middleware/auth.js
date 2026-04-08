const jwt = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing or invalid authorization token' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    return next();
  };
}

function requireParamOwner(paramName, userKey = 'id') {
  return (req, res, next) => {
    const paramValue = Number(req.params[paramName]);
    const userValue = Number(req.user?.[userKey]);

    if (!Number.isFinite(paramValue) || !Number.isFinite(userValue) || paramValue !== userValue) {
      return res.status(403).json({ message: 'Forbidden: token does not match requested resource' });
    }

    return next();
  };
}

function requireBodyOwner(bodyField, userKey = 'id') {
  return (req, res, next) => {
    const bodyValue = Number(req.body?.[bodyField]);
    const userValue = Number(req.user?.[userKey]);

    if (!Number.isFinite(bodyValue) || !Number.isFinite(userValue) || bodyValue !== userValue) {
      return res.status(403).json({ message: 'Forbidden: token does not match request payload' });
    }

    return next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  requireParamOwner,
  requireBodyOwner,
};
