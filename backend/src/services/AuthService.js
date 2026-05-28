const { randomUUID } = require('crypto');

const { pool } = require('../database/mysql');
const BcryptHelper = require('../helpers/bcrypt');
const JwtHelper = require('../helpers/jwt');

class AuthService {
  static async RegisterService(payload) {
    try {
      const name = payload.name.trim();
      const email = payload.email.trim().toLowerCase();
      const password = payload.password;

      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [email],
      );

      if (existingUsers.length > 0) {
        const error = new Error('Email is already registered');
        error.statusCode = 400;
        throw error;
      }

      const id = randomUUID();
      const hashedPassword = await BcryptHelper.hash(password);

      await pool.execute(
        'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
        [id, name, email, hashedPassword],
      );

      return {
        name,
        email,
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        error.message = 'Email is already registered';
        error.statusCode = 400;
      }

      throw error;
    }
  }

  static async LoginService(payload) {
    try {
      const email = payload.email.trim().toLowerCase();
      const password = payload.password;

      const [users] = await pool.execute(
        'SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1',
        [email],
      );

      if (users.length === 0) {
        const error = new Error('Invalid email or password');
        error.statusCode = 400;
        throw error;
      }

      const user = users[0];
      const passwordMatches = await BcryptHelper.compare(password, user.password);

      if (!passwordMatches) {
        const error = new Error('Invalid email or password');
        error.statusCode = 400;
        throw error;
      }

      const token = JwtHelper.sign({
        id: user.id,
        email: user.email,
      });

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;
