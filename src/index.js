const process = require('process');
const { Yberri, bodyParserMiddleware } = require('yberri');
const { initializeRoutes } = require('./routes');
const { dbInjector } = require('./middlewares');
const { RestGenerator } = require('./handlers/restgenerator');

// Models

const { CategoryModel } = require('./models');


const DBURL = 'mongodb://localhost:27017';
const DBNAME = 'restaurant';

const [LOCALHOST, PORT] = process.argv.slice(2);
const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_PORT = 4000;

const host = LOCALHOST || DEFAULT_HOST;
const port = PORT || DEFAULT_PORT;

const app = Yberri();

const restGenerator = RestGenerator(app);
restGenerator.postFor(CategoryModel, '/category');


initializeRoutes(app)
  .applyMiddleware(dbInjector(DBURL, DBNAME))
  .applyMiddleware(bodyParserMiddleware)
  .run(host, port);

