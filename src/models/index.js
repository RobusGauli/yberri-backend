const { Category } = require('./category.model');
const { Employee } = require('./employee.model');
const { EmployeePosition } = require('./employeeposition.model');
const { Item } = require('./item.model');
const { ServiceCharge } = require('./servicecharge.model');
const { Table } = require('./table.model');
const { Tax } = require('./tax.model');
const { Vat } = require('./vat.model');

const { Drink } = require('./drinks.model');


module.exports = {
  Category,
  Item,
  EmployeePosition,
  Employee,
  Table,
  ServiceCharge,
  Tax,
  Vat,
  Drink,
};
