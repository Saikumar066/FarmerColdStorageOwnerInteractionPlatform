const jwt = require('jsonwebtoken');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';
}

function generateToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

module.exports = {
  generateToken,
};
