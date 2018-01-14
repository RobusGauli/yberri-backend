const { jsonValidate } = require('../utils/types');
const envelop = require('../utils/envelop');

function parseAndCheckJsonType(func, payloadType) {
  if (payloadType === undefined) {
    throw new Error('Please pass the valid JSON type.');
  }
  return (request, response) => {
    const { body } = response;
    try {
      const parsedBody = JSON.parse(body);
      // now check JSON types validation
      // off in production mode for performance
      const {
        message,
        spec,
        success,
      } = jsonValidate(payloadType, parsedBody);
      if (success) {
        request.parsedBody = parsedBody;
        return func(request, response);
      } 
      response.badRequestError(envelop.requestValidationError({
        requiredJsonSpec: spec,
        validationMessage: message,
      }));
    } catch (error) {
      console.log(error);
      if (error instanceof SyntaxError) {
        response.badRequestError(envelop.invalidJSONError());
      } else {
        response.internalServerError(envelop.unknownError());
      }
    }
    return null; // to silent the es-lint
  };
}

module.exports = {
  parseAndCheckJsonType,
};
