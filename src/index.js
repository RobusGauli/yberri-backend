const mongodb = require('mongodb');
const { Yberri, bodyParserMiddleware } = require('yberri');
const { initializeRoutes } = require('./routes');
const { Lazy } = require('./utils');

const url = 'mongodb://localhost:27017';
const controller = Lazy([4, 5, 56, 7])
  .map(x => x * x)
  .apply();

console.log(controller.get(3));
// root
(async (dbUrl) => {
  // console.log(app);
  try {
    const client = await mongodb.connect(dbUrl)
    const db = client.db('test');
    const app = Yberri();
    app
      .applyMiddleware(dbInjector(db))
      .applyMiddleware(bodyParserMiddleware);
    // initialize the App instannce
    initializeRoutes(app);
    // const main = App(app, db);
    app.run('0.0.0.0', 4000);
  } catch (error) {
    // console.log(error);
  }
})(url);

// console.log(getConnection());


const dbInjector = db => (handler, request, response, ...args) => {
  // we can inject the facin
  response.db = db;
  return Promise.resolve([handler, request, response, ...args]);
};
