
const { Types, jsonValidate } = require('../utils/types');
const envelop = require('../utils/envelop');
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
      response.badRequestError(envelop.requestValidationError({
        requiredJsonSpec: spec,
        validationMessage: message,
      }));
    } catch (error) {
      if (error instanceof SyntaxError) {
        response.badRequestError(envelop.invalidJSONError());
      } else {
        response.internalServerError(envelop.unknownError());
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
    response.jsonify(envelop.dataEnvelop(parsedBody));
  } catch (error) {
    if (error instanceof MongoError) {
      if (error.code === 11000) {
        // that means we have a duplicate key
        response.badRequestError(envelop.duplicateValueError(parsedBody.tableName));
      }
    } else {
      response.internalServerError(envelop.unknownError());
    }
  }
}

async function getTables(request, response) {
  // this handle just get all the elements from the tables and do its thing
  const { db } = response;
  try {
    const cursor = await db.collection('tables').find();
    const data = await cursor.toArray();
    response.jsonify(envelop.dataEnvelop(data));

  } catch (error) {
    response.internalServerError(envelop.unknownError());
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
    response.jsonify(envelop.dataEnvelop(document));
  } catch (error) {
    if (error instanceof DataNotFoundError) {
      response.badRequestError(envelop.notFoundError(tableName));
    } else {
      response.internalServerError(envelop.unknownError());
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
    response.jsonify(envelop.dataEnvelop(updatedDocument));
  } catch (error) {
    if (error instanceof UpdateFailureError) {
      response.badRequestError(envelop.cannotUpdateError(tableName));
    } else if (error instanceof MongoError) {
      // new value matches the current unique value in db
      if (error.code === 11000) {
        response.badRequestError(envelop.duplicateValueError(parsedBody.tableName));
      }
    } else {
      response.internalServerError(envelop.unknownError());
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
