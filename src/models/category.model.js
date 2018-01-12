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
};

module.exports = {
  Category,
};

