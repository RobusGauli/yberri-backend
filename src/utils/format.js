const Types = require('./index');

const tableData = Types.objectOf({
  name: Types.string,
  age: Types.number,
  friends: Types.arrayOf(Types.number),
  address: Types.objectOf({
    addressOne: Types.string,
    addressTwo: Types.bool,
  })
}).isRequired;

function formatToJson(type) {
  //get the type and start evaluating
  const typeInstance = type();
  switch(typeInstance.name) {
    case 'objectOf': {
      return evaluateObjectOf(typeInstance);
      break;
    }
    case 'arrayOf': {
      return evaluateArrayOf(typeInstance);
      break;
    }
    case 'string': {
      return evaluateString(typeInstance);
      break;
    }

    case 'number': {
      return evaluateNumber(typeInstance);
      break;
    }
    case 'boolean': {
      return evaluateBoolean(typeInstance);
      break;
    }
    default: {
      console.log('error')
    }
  }
}


function evaluateObjectOf(typeInstance) {
  //here we have the plain Object
  let _result = {};
  for (key in typeInstance.plainObject) {
    _result[key] = formatToJson(typeInstance.plainObject[key]);
  }
  return _result;
}

function evaluateArrayOf(typeInstance) {
  let _result = [];
  //console.log(typeInstance)
  _result.push(formatToJson(typeInstance.typeChecker))
  return _result;

}

function evaluateString(typeInstance) {
  return 'String'
}

function evaluateNumber(typeInstance) {
  return 12;
}

function evaluateBoolean(typeInstance) {
  return Math.random() >= 0.5 ? 
    true : 
    false
}

console.log(formatToJson(tableData))