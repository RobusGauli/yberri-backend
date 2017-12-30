const mongodb = require('mongodb');
const { Yberri, bodyParserMiddleware } = require('yberri');
const { initializeRoutes } = require('./routes');

const url = 'mongodb://localhost:27017';

// root
(async (dbUrl) => {
  // console.log(app);
  try {
    const client = await mongodb.connect(dbUrl)
    const db = client.db('test');
    const app = Yberri()
    app
      .applyMiddleware(dbInjector(db))
      .applyMiddleware(bodyParserMiddleware);
    // initialize the App instannce
    initializeRoutes(app);
    // const main = App(app, db);
    app.run('localhost', 4000);
  } catch (error) {
    // console.log(error);
  }
})(url);

// console.log(getConnection());


const dbInjector = db => (handler, request, response, ...args) => {
  // we can inject the facin
  response.db = db;
  return Promise.resolve([handler, request, response, ...args]);

}

const App = (app, db) => {
  return new class {
    constructor(app, db) {
      this._app = app;
      this._db = db;
      //this._app.route('/home', this.getTables, ['POST']);
      
    }

    async getTables(request, response) {
      //get the handle to the database
      const { db, body } = response
      try {
        const r = await db.collection('inserts')
        .insertOne(JSON.parse(body));
      response.jsonify({"done" : "succesfuull" + r.insertedCount});
      } catch(error) {
        console.log(error);
      }
      
    }

  }(app, db);
}