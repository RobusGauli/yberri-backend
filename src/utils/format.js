
/**
 * A Given a types it will return us the required sample json
 * 
 * 
 * const person = Types.objectOf({
 *  name: Types.string,
 *  age: Types.age,
 * });
 * 
 * 
 * Output
 * { name: "string", age: 34} 
 */

module.exports = formatToJson;

const Types = require('./types');

/* eslint-disable no-plusplus */
function evaluateObjectOf(typeInstance) {
  // here we have the plain Object
  const result = {};
  const keys = Object.keys(typeInstance.plainObject);
  for (let i = 0; i < keys.length; i++) {
    result[keys[i]] = formatToJson(typeInstance.plainObject[keys[i]]);
  }
  return result;
}
/* eslint-enable no-plusplus */

function evaluateArrayOf(typeInstance) {
  const result = [];
  result.push(formatToJson(typeInstance.typeChecker));
  return result;

}

function evaluateString() {
  return 'String';
}

function evaluateNumber() {
  return 12;
}

function evaluateBoolean() {
  return Math.random() >= 0.5;
}

function formatToJson(type) {
  // get the type and start evaluating
  const typeInstance = type();
  switch (typeInstance.name) {
    case 'objectOf': {
      return evaluateObjectOf(typeInstance);
    }
    case 'arrayOf': {
      return evaluateArrayOf(typeInstance);
    }
    case 'string': {
      return evaluateString(typeInstance);
    }

    case 'number': {
      return evaluateNumber(typeInstance);
    }
    case 'boolean': {
      return evaluateBoolean(typeInstance);
    }
    default: {
      return null;
    }
  }
}


const person = Types.objectOf({
  name: Types.string.isRequired,
  friends: Types.arrayOf(Types.number),
  address: Types.objectOf({
    one: Types.string.isRequired,
  }),
})

console.log(formatToJson(person));