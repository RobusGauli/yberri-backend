// middleware for requiring the authentication
const jwt = require('jsonwebtoken');
const error = require('./error');
const { JWT_SECRET } = require('.');

const authenticateDecorator = func => (request, response) => {
  // get the header parameter

  const { headers } = request;
  if (Object.prototype.hasOwnProperty.call(headers, 'authorization')) {
    const { authorization: token } = headers;
    if (token === undefined || token === null) {
      response.unauthorizedError(error.autheticationError);
    }
    try {
      const result = jwt.verify(token, JWT_SECRET);
      console.log(result);
      return func(request, response);
    } catch (_error) {
      if (_error instanceof jwt.JsonWebTokenError) {
        response.unauthorizedError(error.autheticationError);
      }
      response.unauthorizedError(error.autheticationError);
    }
  } 
  return response.unauthorizedError(error.autheticationError);
};

module.exports = {
  authenticateDecorator,
};
