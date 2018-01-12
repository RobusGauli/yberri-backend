const { Types } = require('../utils/types');

const Item = {
  collection: 'items',
  payloadType: Types.objectOf({
    name: Types.string.isRequired,
    photoUri: Types.string,
    unitPrice: Types.string.isRequired,
    category: Types.objectOf({
      categoryName: Types.string.isRequired,
      categoryId: Types.string.isRequired,
    }).isRequired,
    isActive: Types.bool.isRequired,
  }),
  index: {
    fields: ['name'],
    unique: true,
  },
};

module.exports = {
  Item,
};