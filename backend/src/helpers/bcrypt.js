const bcrypt = require('bcrypt');

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

class BcryptHelper {
  static hash(password) {
    return bcrypt.hash(password, saltRounds);
  }

  static compare(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = BcryptHelper;
