const mongodb = require('mongodb');

const dbInjector = (dbUrl, dbName) => async (handler, request, response) => {
  // we can inject the facin
  try {
    const client = await mongodb.connect(dbUrl);
    const db = client.db(dbName);
    response.db = db;
    return Promise.resolve([handler, request, response]);   
  } catch (error) {
    return Promise.reject(dbInjectorErrorHandler);
  }
};


const dbInjectorErrorHandler = (..._) => {
  throw new Error('could not connect to mongo daemon');
};

module.exports = {
  dbInjector,
};
