const { Types } = require('../utils/types');

const Tax = {
  collection: 'taxes',
  payloadType: Types.objectOf({
    name: Types.string.isRequired,
    value: Types.string.isRequired,
    isActive: Types.bool.isRequired,
  }),
};

module.exports = {
  Tax,
};