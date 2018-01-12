const { Types } = require('../utils/types');


const Category = {
  collection: 'categories',
  payloadType: Types.objectOf({
    name: Types.string.isRequired,
  }),
  index: {
    fields: ['name'],
    unique: true,
  },
  relationships: {
    items: {
      collectionName: 'items',
      rel: 'onetomany',
    },
  },
};

module.exports = {
  Category,
};

