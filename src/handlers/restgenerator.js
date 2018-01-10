const { Types } = require('../utils/types');
const { parseAndCheckJsonType } = require('./decorators');
const { MongoError } = require('mongodb');
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
    async function getResourceHandler(request, response) {
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

    this.app.route(path, getResourceHandler, ['GET']);
  }
};

const RestGenerator = app => new _RestGenerator(app);

module.exports = {
  RestGenerator,
};

