const { Types } = require('../utils/types');
const { parseAndCheckJsonType } = require('./decorators');
const { MongoError, ObjectID } = require('mongodb');
const envelop = require('../utils/envelop');

class _RestGenerator {
  constructor(app) {
    // app instance so that we can route the handler efficiently
    this.app = app;
  }

  postFor(model, path) {
    const { payloadType, collection: __collectionName, index } = model; 
    async function postHandler(request, response) {
      const { db } = response;
      const { parsedBody } = request;
      
      const collection = db.collection(__collectionName);
      if (index) {
        const indexFields = index.fields.reduce((acc, val) =>
          ({ ...acc, [ val ] : 1 }), {});
        collection.createIndex(indexFields, {unique: index.unique ? index.unique : false })
      }

      try {
        await collection.insertOne(parsedBody);
        response.jsonify(envelop.dataEnvelop(parsedBody));
      } catch (error) {
        if (error instanceof MongoError) {
          if (error.code === 11000) {
            // that means we have a duplicate key
            response.badRequestError(envelop.duplicateValueError(parsedBody));
          } else {
            response.internalServerError(envelop.unknownError());
          }
        } else {
          response.internalServerError(envelop.unknownError());
        }
      }

    }
    this.app.route(path, parseAndCheckJsonType(postHandler, payloadType), ['POST']);
  }

  getFor(model, path) {
    const { collection: __collectionName } = model;
    async function getResourcesHandler(request, response) {
      // this handle just get all the elements from the tables and do its thing
      const { db } = response;
      const collection = db.collection(__collectionName);
      try {
        const cursor = await collection.find();
        const data = await cursor.toArray();
        response.jsonify(envelop.dataEnvelop(data));
    
      } catch (error) {
        response.internalServerError(envelop.unknownError());
      }
    }

    async function getResourceHandler(request, response) {
      const { db } = response;
      const collection = db.collection(__collectionName);
      const { _id } = request.variablePath;
      const query = {
        _id: ObjectID.createFromHexString(_id),
      };
      try {
        const document = await collection.findOne(query);
        response.jsonify(envelop.dataEnvelop(document));
      } catch (error) {
        response.internalServerError(envelop.unknownError());
      }
    }

    this.app.route(path, getResourcesHandler, ['GET']);
    this.app.route(`${path}/<_id>`, getResourceHandler, ['GET']);
  }


  updateFor(model, path) {
    const { collection: __collectionName } = model;

    // get the id path from the url
    async function updateResourceHandler(request, response) {
      const { _id } = request.variablePath;
      console.log(_id);
      const { parsedBody, db } = response;
      console.log(parsedBody);
      
      // get the db isntance
      const collection = db.collection(__collectionName);

      // now that we have the parsed body, we set the update parameter in mongodb
      // filter parameter

      const query = {
        _id: ObjectID.createFromHexString(_id),
      }
      // udpate paramter
      const update = {
        $set: parsedBody,
      };
      // options parameter
      const options = {
        returnOriginal: false,
      };
      try {
        const resultCommand = await collection.findOneAndUpdate(
          query,
          update,
          options,
        );
        // get the updated document
        const { value: updatedDocument } = resultCommand;
        console.log(resultCommand);
        response.jsonify(envelop.dataEnvelop(updatedDocument));
    
      } catch (error) {
        console.log(error);
        if (error instanceof MongoError) {
          if (error.code === 11000) {
            // that means this duplicate error message
            response.badRequestError(envelop.duplicateValueError(parsedBody));
          } else {
            response.badRequestError(envelop.unknownError());
          }
        } else {
          response.badRequestError(envelop.unknownError());
        }
      }
    }

    this.app.route(`${path}/<_id>`, jsonParseCheckDecorator(updateResourceHandler), ['PUT']);
  }
}

const RestGenerator = app => 
  new _RestGenerator(app);

module.exports = {
  RestGenerator,
};

const jsonParseCheckDecorator = func => (request, response) => {
  // get the body from the response
  const { body } = response;

  try {
    const parsedBody = JSON.parse(body);
    // augment the parsedBody to the response object
    response.parsedBody = parsedBody;
    return func(request, response);
  } catch (error) {
    response.badRequestError(envelop.invalidJSONError());
  }
}
