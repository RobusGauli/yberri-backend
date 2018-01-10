const {
  createTable,
  getTables,
  getTable,
  updateTable,
} = require('./handlers');

const createRoutes = routes => (app) => {
  // get the routes and write down
  routes.forEach((value) => {
    // get the key and
    //console.log(value[1]);
    app.route(value.path, value.handler, value.methods ? value.methods : ['GET']);
  });
  return app;
};

const initializeRoutes = createRoutes([
  {
    path: '/tables',
    handler: createTable,
    methods: ['POST'],
  },
  {
    path: '/home/shop',
    handler: createTable,
    methods: ['GET'],
  },
  {
    path: '/tables',
    handler: getTables,
    methods: ['GET'],
  },
  {
    path: '/tables/<tableName>',
    handler: getTable,
    methods: ['GET'],
  },
  {
    path: '/tables/<tableName>',
    handler: updateTable,
    methods: ['PUT'],
  },
]);


module.exports = {
  initializeRoutes,
};
