const { Types } = require('../utils/types');

const Item = {
  collection: 'items',
  payloadType: Types.objectOf({
    name: Types.string.isRequired,
    photoUri: Types.string,
    unitPrice: Types.string.isRequired,
    categoryId: Types.string.isRequired,
    isActive: Types.bool.isRequired,
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
  Item,
};