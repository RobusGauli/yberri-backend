const { Types } = require('../utils/types');

const Vat = {
  collection: 'vats',
  payloadType: Types.objectOf({
    name: Types.string.isRequired,
    value: Types.string.isRequired,
    isActive: Types.bool.isRequired,
  }),
};

module.exports = {
  Vat,
};