const { Yberri, bodyParserMiddleware } = require('yberri');
const { initializeRoutes } = require('./routes');
const { dbInjector } = require('./middlewares');

const url = 'mongodb://localhost:27017';

// root
(async (dbUrl) => {
  // console.log(app);
  initializeRoutes(Yberri())
    .applyMiddleware(dbInjector(dbUrl))
    .applyMiddleware(bodyParserMiddleware)
    .run('0.0.0.0', 4000);
})(url);
