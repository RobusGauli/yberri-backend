const { Types } = require('../utils/types');

const EmployeePosition = {
  collection: 'employeepositions',
  payloadType: Types.objectOf({
    name: Types.string.isRequired,
    description: Types.string,
    isActive: Types.bool.isRequired,
  }),
  index: {
    fields: ['name'],
    unique: true,
  },
};

module.exports = {
  EmployeePosition,
};