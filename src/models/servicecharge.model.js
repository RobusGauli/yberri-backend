const { Types } = require('../utils/types');

const ServiceCharge = {
  collection: 'servicecharges',
  payloadType: Types.objectOf({
    name: Types.string.isRequired,
    value: Types.string.isRequired,
    isActive: Types.bool.isRequired,
  }),
};

module.exports = {
  ServiceCharge,
};