const { Types } = require('../utils/types');

const Employee = {
  collection: 'employees',
  payloadType: Types.objectOf({
    firstName: Types.string.isRequired,
    middleName: Types.string,
    lastName: Types.string.isRequired,
    dataOfBirth: Types.string,
    address: Types.string,
    photoUri: Types.string,
    email: Types.string,
    employeePosition: Types.objectOf({
      employeePositionName: Types.string.isRequired,
      employeePositionId: Types.string.isRequired,
    }),
  }),
  index: {
    fields: ['firstName', 'lastName', 'email'],
    unique: true,
  },
};

module.exports = {
  Employee,
};
