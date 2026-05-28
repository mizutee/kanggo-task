const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'development-secret';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

class JwtHelper {
  static sign(payload) {
    return jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpiresIn,
    });
  }

  static verify(token) {
    return jwt.verify(token, jwtSecret);
  }
}

module.exports = JwtHelper;
