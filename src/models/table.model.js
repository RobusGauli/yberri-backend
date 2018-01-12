const { Types } = require('../utils/types');

const Table = {
  collection: 'tables',
  payloadType: Types.objectOf({
    name: Types.string.isRequired,
    capacity: Types.number.isRequired,
    isActive: Types.bool.isRequired,
  }),
  index: {
    fields: ['name'],
    unique: true,
  },
};

module.exports = {
  Table,
};