const { Types } = require('../utils/types');

const Drink = {
  collection: 'drinks',
  payloadType: Types.objectOf({
    name: Types.string.isRequired,
    categoryId: Types.string.isRequired,
    isActive: Types.bool,
  }),
  index: {
    fields: ['name'],
    unique: true,
  },
  relationships: {
    category: {
      collectionName: 'categories',
      rel: 'manytoone',
      foreignKey: 'categoryId',
    },
  },
};

module.exports = {
  Drink,
};