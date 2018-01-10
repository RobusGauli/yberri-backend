
const { Types, jsonValidate } = require('../utils/types');
const { MongoError } = require('mongodb'); 

class DataNotFoundError extends Error {
  constructor(errorText) {
    super(errorText);
    this.errorText = errorText;
  }
}

class UpdateFailureError extends Error {
  constructor(errorText) {
    super(errorText);
    this.error = errorText;
  }
}

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

const dataNotFoundError = data => ({
  status: 'fail',
  message: 'Data not found',
  data: null,
  success: false,
  errorMessage: `${data} does not exists`,
  code: 400,
});

const successPayload = data => ({
  status: 'success',
  success: true,
  data,
  code: 200,
});

const updateFailureError = data => ({
  status: 'fail',
  message: 'Data not found',
  data: null,
  success: false,
  errorMessage: `Cannot update because ${data} does not exists.`,
  code: 400,
});

function parseAndCheckJsonType(func) {
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
    tableName: parsedBody.tableName.trim(),
    tableNameInternal: parsedBody.tableName.trim().split(' ').join('').toLowerCase(),
  };
  const coll = db.collection('tables');
  try {
    coll.createIndex({ tableNameInternal: 1 }, { unique: true });
    await coll.insertOne(toInsertDocument);
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
    const cursor = await db.collection('tables').find();
    const data = await cursor.toArray();
    response.jsonify(successPayload(data));

  } catch (error) {
    console.log(error);
    response.end(JSON.stringify(unknownError));
  }
}

async function getTable(request, response) {
  const { db } = response;
  const { tableName } = request.variablePath;
  const tableNameInternal = tableName.trim().split(' ').join('');
  try {
    const document = await db.collection('tables').findOne({ tableNameInternal });
    if (document === null) {
      throw new DataNotFoundError('Not found');
    }
    response.jsonify(successPayload(document));
  } catch (error) {
    if (error instanceof DataNotFoundError) {
      response.writeHead(400, {
        'Content-Type': 'json/application',
      });
      response.end(JSON.stringify(dataNotFoundError(tableName)));
    } else {
      response.writeHead(400, {
        'Content-Type': 'json/application',
      });
      response.end(JSON.stringify(unknownError));
    }
  }
}

async function updateTable(request, response) {
  const { db } = response;
  const { tableName } = request.variablePath;
  const { parsedBody } = request;
  const tableNameInternal = tableName.trim().split(' ').join('').toLowerCase();

  const newTableNameInternal = parsedBody.tableName
    .trim()
    .split(' ')
    .join('')
    .toLowerCase();
  // collection object
  const coll = db.collection('tables');
  try {
    const mongoQueryObject = [
      { tableNameInternal }, // filter on document
      { $set: { tableName: parsedBody.tableName.trim(), tableNameInternal: newTableNameInternal } }, // update
      {
        returnNewDocument: true,
      },
    ];

    const updatedDocument = await coll.findOneAndUpdate(...mongoQueryObject);
    if (updatedDocument.value === null) {
      throw new UpdateFailureError('Update Failure');
    }
    response.jsonify(successPayload(updatedDocument));
  } catch (error) {
    if (error instanceof UpdateFailureError) {
      response.writeHead(400, {
        'Content-Type': 'json/application',
      });
      response.end(JSON.stringify(updateFailureError(tableName)));
    } else {
      response.writeHead(400, {
        'Content-Type': 'json/application',
      });
      response.end(JSON.stringify(unknownError));
    }
  }
}
// decorator
createTable = parseAndCheckJsonType(createTable);
updateTable = parseAndCheckJsonType(updateTable);

module.exports = {
  createTable,
  getTables,
  getTable,
  updateTable,
};
