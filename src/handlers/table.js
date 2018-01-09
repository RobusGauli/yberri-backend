
const { Types, jsonValidate } = require('../utils/types');
const { assert } = require('assert');
const { MongoError } = require('mongodb'); 

const tableFormatType = Types.objectOf({
  tableName: Types.string.isRequired,
}).isRequired;

const invalidJsonError = {
  status: 'fail',
  success: false,
  message: 'Failed to parse JSON',
  data: null,
  code: 400,
};

const unknownError = {
  status: 'fail',
  success: false,
  message: 'Unknown Error',
  data: null,
  code: 400,
};

const invalidFieldError = (message, spec) => ({
  status: 'fail',
  message: 'Json field Validation Error',
  data: null,
  success: false,
  errorMessage: message,
  requiredJsonSpec: spec,
  code: 400,
});

const duplicateDataError = data => ({
  status: 'fail',
  message: 'Duplicate Key',
  data: null,
  success: false,
  errorMessage: `${data} already exists.`,
  code: 400,
});

const successPayload = data => ({
  status: 'success',
  success: true,
  data,
  code: 200,
});

function checkJsonType(func) {
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
      } = jsonValidate(tableFormatType, parsedBody);
      if (success) {
        request.parsedBody = parsedBody;
        return func(request, response);
      } 
      response.writeHead(400, {
        'Content-Type': 'application/json',
      });
      response.end(JSON.stringify(invalidFieldError(message, spec)));
    } catch (error) {
      response.writeHead(404, {
        'Content-Type': 'application/json',
      });
      if (error instanceof SyntaxError) {
        response.end(JSON.stringify(invalidJsonError));
      } else {
        response.end(JSON.stringify(unknownError));
      }
    }
  };
}

async function createTable(request, response) {
  const { db } = response;
  const { parsedBody } = request;
  const toInsertDocument = {
    _id: parsedBody.tableName,
  };
  try {
    await db.collection('tables').insertOne(toInsertDocument);
    response.jsonify(successPayload(parsedBody));
  } catch (error) {
    if (error instanceof MongoError) {
      if (error.code === 11000) {
        // that means we have a duplicate key
        response.writeHead(400, {
          'Content-Type': 'application/json',
        });
        response.end(JSON.stringify(duplicateDataError(parsedBody.tableName)));
      }
    } else {
      response.writeHead(400, {
        'Content-Type': 'application/json',
      });
      response.end(JSON.stringify(unknownError));
    }
  }
}

async function getTables(request, response) {
  // this handle just get all the elements from the tables and do its thing
  const { db } = response;
  try {
    const r = await db.collection('tables').find();
    response.jsonify(r);
  } catch (error) {
    console.log(error);
    response.end(JSON.stringify(unknownError));
  }
}

// decorator
createTable = checkJsonType(createTable);

module.exports = {
  createTable,
  getTables,
}