const { Types } = require('../utils/types');
const { parseAndCheckJsonType } = require('../decorators');
const { MongoError, ObjectID } = require('mongodb');
const envelop = require('../utils/envelop');

const methodRegistry = {};

// decorator function that registers the method
const register = path => (func) => {
  methodRegistry[path] = func;
  return func;
};

class _RestGenerator {
  constructor(app) {
    // app instance so that we can route the handler efficiently
    this.app = app;
    // decorator feature not available in plain es5 so here you go
    this.postFor = register('POST')(this.postFor);
    this.getFor = register('GET')(this.getFor);
    this.deleteFor = register('DELETE')(this.deleteFor);
    this.updateFor = register('PUT')(this.updateFor);
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

  deleteFor(model, path) {
    const { collection: __collectionName } = model;

    async function deleteResourceHandler(request, response) {
      // db instance
      const { db } = response;
      const { _id } = request.variablePath;

      const collection = db.collection(__collectionName);
      const query = {
        _id: ObjectID.createFromHexString(_id),
      }
      try {
        const doc = await collection.findOneAndDelete(query);
        console.log(doc)
        response.jsonify(envelop.dataEnvelop(doc));
      } catch (error) {
        console.log(error);
        response.badRequestError(envelop.unknownError);
      }
    }
    this.app.route(`${path}/<_id>`, deleteResourceHandler, ['DELETE']);
  }

  restFor(model, path, methods = ['GET', 'POST', 'PUT', 'DELETE']) {
    if (Array.isArray(methods)) {
      methods.forEach((methodName) => {
        let func = methodRegistry[methodName];
        
        if (typeof func === 'function') {
          func = func.bind(this); // bind the function to this context
          func(model, path);
        }
      });
    }
  }
}

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

const RestGenerator = app =>
  new _RestGenerator(app);

module.exports = {
  RestGenerator,
};
