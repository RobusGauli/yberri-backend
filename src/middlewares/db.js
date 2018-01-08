const mongodb = require('mongodb');

const dbInjector = dbUrl => async (handler, request, response, ...args) => {
  // we can inject the facin
  try {
    const client = await mongodb.connect(dbUrl);
    const db = client.db('test');
    response.db = db;
    return Promise.resolve([handler, request, response, ...args]);   
  } catch (error) {
    return Promise.reject(dbInjectorErrorHandler);
  }
};


const dbInjectorErrorHandler = (request, response, ...args) => {
  throw new Error('could not connect to mongo daemon');
};

module.exports = {
  dbInjector,
};
