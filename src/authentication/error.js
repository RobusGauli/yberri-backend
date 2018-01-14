// AUTHENTICATION ERROR

const USER_NOT_FOUND_ERROR = 'USER_NOT_FOUND_ERROR';
const USER_NOT_FOUND_ERROR_MESSAGE = 'The username you have entered doesn\t match any account.';

const USER_ALREADY_REGISTERED = 'USER_ALREADY_REGISTERED';
const USER_ALREADY_REGISTERED_MESSAGE = 'The username you have entered is already registered.';

const USERNAME_OR_PASSWORD_NOT_MATCH = 'USERNAME_OR_PASSWORD_NOT_MATCH';
const USERNAME_OR_PASSWORD_NOT_MATCH_MESSAGE = 'The username or password does not match.';

const TOKEN_EXPIRE_ERROR = 'TOKEN_EXPIRE_ERROR';
const TOKEN_EXPIRE_ERROR_MESSAGE = 'Token is expired';

class Envelop {
  constructor(code, success, status, data) {
    this.code = code;
    this.success = success;
    this.status = status;
    this.data = data;
  }

  stringify(augment = {}) {
    return JSON.stringify({ ...this, ...augment });
  }
}

const errorEnvelop = (errorType, errorMessage) => {
  return new (
    class extends Envelop {
      constructor() {
        super(400, false, 'fail', null);
        this.errorType = errorType;
        this.errorMessage = errorMessage;
      }
    }
  )();
};

module.exports = {
  userNotFoundError: errorEnvelop(
    USER_NOT_FOUND_ERROR,
    USER_NOT_FOUND_ERROR_MESSAGE,
  ).stringify(),
  userAlreadyRegistered: errorEnvelop(
    USER_ALREADY_REGISTERED,
    USER_ALREADY_REGISTERED_MESSAGE,
  ).stringify(),
  usernameOrPasswordNotMatch: errorEnvelop(
    USERNAME_OR_PASSWORD_NOT_MATCH,
    USERNAME_OR_PASSWORD_NOT_MATCH_MESSAGE,
  ).stringify(),
  tokenExpiredError: errorEnvelop(
    TOKEN_EXPIRE_ERROR,
    TOKEN_EXPIRE_ERROR_MESSAGE,
  ).stringify(),
};
