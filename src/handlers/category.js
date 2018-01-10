const { Types } = require('../utils/types');


const Person = {
  collection: 'persons',
  payloadType: Types.objectOf({
    name: Types.string.isRequired,
    age: Types.string.isRequired,
  }),
  index: {
    fields: ['name', 'age'],
    unique: true,
  },
};

module.exports = {
  Person,
};

