const {
  createTable,
} = require('./handlers');

const createRoutes = routes => (app) => {
  // get the routes and write down
  Object.entries(routes).forEach(([key, value]) => {
    // get the key and
    app.route(key, value.handler, value.methods ? value.methods : ['GET']);
  });
  return app;
};

const initializeRoutes = createRoutes({
  '/home': {
    handler: createTable,
    methods: ['POST'],
  },
  '/home/shop': {
    handler: createTable,
    methods: ['GET'],
  },
});


module.exports = {
  initializeRoutes,
};
