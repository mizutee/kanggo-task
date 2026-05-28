const JwtHelper = require('../helpers/jwt');
const ResponseHandler = require('../helpers/response');

function AuthMiddleware(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return ResponseHandler.error(res, {
      message: 'Authorization token is required',
      statusCode: 401,
    });
  }

  const [tokenType, token] = authorizationHeader.split(' ');

  if (tokenType?.toLowerCase() !== 'bearer' || !token) {
    return ResponseHandler.error(res, {
      message: 'Invalid authorization token',
      statusCode: 401,
    });
  }

  try {
    const decodedToken = JwtHelper.verify(token);

    req.user = {
      id: decodedToken.id,
      email: decodedToken.email,
    };

    return next();
  } catch (error) {
    return ResponseHandler.error(res, {
      message: 'Invalid or expired token',
      statusCode: 401,
    });
  }
}

module.exports = AuthMiddleware;
