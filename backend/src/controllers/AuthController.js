const ResponseHandler = require('../helpers/response');
const { validatePayload } = require('../helpers/payload');
const AuthService = require('../services/AuthService');


class AuthController {
  static async RegisterController(req, res) {
    const registerFields = [
      { key: 'name', required: true },
      { key: 'email', required: true },
      { key: 'password', required: true },
    ];
    try {
      const payload = validatePayload(registerFields, req.body);

      if (!payload.isValid) {
        return ResponseHandler.error(res, { message: payload.error }, 400);
      }

      if (payload.data.password.length < 8) {
        return ResponseHandler.error(res, {
          message: {
            password: 'password must be at least 8 characters!',
          },
        }, 400);
      }

      const user = await AuthService.RegisterService(payload.data);

      return ResponseHandler.success(res, {
        user,
      }, 201, 'User registered successfully');
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  static async LoginController(req, res) {
    const loginFields = [
      { key: 'email', required: true },
      { key: 'password', required: true },
    ];

    try {
      const payload = validatePayload(loginFields, req.body);

      if (!payload.isValid) {
        return ResponseHandler.error(res, { message: payload.error }, 400);
      }

      const loginData = await AuthService.LoginService(payload.data);

      return ResponseHandler.success(res, loginData, 200, 'Login successful');
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }
}

module.exports = AuthController;
