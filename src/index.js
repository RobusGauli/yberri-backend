const { Yberri, bodyParserMiddleware } = require('yberri');
const { initializeRoutes } = require('./routes');
const { dbInjector } = require('./middlewares');

const DBURL = 'mongodb://localhost:27017';

initializeRoutes(Yberri())
  .applyMiddleware(dbInjector(DBURL))
  .applyMiddleware(bodyParserMiddleware)
  .run('0.0.0.0', 4000);

