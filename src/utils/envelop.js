// ERROR TYPES
const REQUEST_VALIDATION_ERROR = 'REQUEST_VALIDATION_ERROR';
const INVALID_JSON_ERROR = 'INVALID_JSON_ERROR';
const DUPLICATE_VALUE_ERROR = 'DUPLICATE_VALUE_ERROR';
const NOT_FOUND_ERROR = 'NOT_FOUND_ERROR';
const CANNOT_UPDATE_ERROR = 'CANNOT_UPDATE_ERROR';
const UNKNOWN_ERROR = 'UNKOWN_ERROR';

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

class ErrorEnvelop extends Envelop {
  constructor(errorType, errorMessage) {
    super(400, false, 'fail', null);
    this.errorType = errorType;
    this.errorMessage = errorMessage;
  }
}

class DataEnvelop extends Envelop {
  constructor(data, message = null) {
    super(200, true, 'success', data);
    this.message = message;
  }
}

// ERROR ENVELOP

const invalidJSONError = () =>
  (new ErrorEnvelop(INVALID_JSON_ERROR, 'Failed to parse JSON.'))
    .stringify();

const unknownError = () =>
  (new ErrorEnvelop(UNKNOWN_ERROR, 'Unknown Error.'))
    .stringify();

const requestValidationError = validationError =>
  (new ErrorEnvelop(REQUEST_VALIDATION_ERROR, 'Request validation Error.'))
    .stringify({ validationError });

const duplicateValueError = value =>
  (new ErrorEnvelop(DUPLICATE_VALUE_ERROR, `${value} already exists.`))
    .stringify();

const notFoundError = (value = '') =>
  (new ErrorEnvelop(NOT_FOUND_ERROR,`${value} not found.` ))
    .stringify();

const cannotUpdateError = value =>
  (new ErrorEnvelop(CANNOT_UPDATE_ERROR, `Cannot update because ${value} does not exists.`))
    .stringify();

// DATA ENVELOP

const dataEnvelop = data =>
  (new DataEnvelop(data))
    .stringify();


const envelop = {
  invalidJSONError,
  unknownError,
  requestValidationError,
  duplicateValueError,
  notFoundError,
  cannotUpdateError,
  dataEnvelop,
};


module.exports = envelop;
