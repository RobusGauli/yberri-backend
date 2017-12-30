// util fuction to get the type typeOf any value

// quirks typeof null --> "object" Booooooooya

function getPreciseType(value) {
  if (typeof value === 'undefined' || value === null /* boo */) {
    return `${value}`;
  }

  const type = typeof value;
  // check for the object being array
  if (Array.isArray(type)) {
    return 'array';
  }
  return type;
}

const Types = {
  string: createPrimitiveTypeChecker('string'),
  number: createPrimitiveTypeChecker('number'),
  bool: createPrimitiveTypeChecker('boolean'),
  arrayOf: createArrayOfTypeChecker,
  objectOf: createObjectOfTypeChecker,
};

module.exports = Types;


// here we will pass in the another type checker
function createArrayOfTypeChecker(typeChecker) {
  function validate(isRequired) {
    return new (class {
      constructor() {
        this.name = 'arrayOf';
        this.isRequired = isRequired;
        this.typeChecker = typeChecker;
      }

      validate(value) {
        // here is the validation for the arrayof Type checker
        console.log(this.name, value);
      }
    })();
  }

  const validateFunction = validate.bind(null, false);
  validateFunction.isRequired = validate.bind(null, true);
  return validateFunction;
}

function createObjectOfTypeChecker(plainObject) {
  function validate(isRequired) {
    return new (class {

      constructor() {
        this.name = 'objectOf'
        this.isRequired = isRequired;
        this.plainObject = plainObject;
      }

      validate(value) {
        // here is the validation for the arrayof Type checker
        console.log(value, this.name);
      }
    })();
  }
  let validatorFunction = validate.bind(null, false);
  validatorFunction.isRequired = validate.bind(null, true);
  return validatorFunction;
} 


function createPrimitiveTypeChecker(expectedType) {
  function validate(isRequired) {
    return new (class {

      constructor() {
        this.name = expectedType;
        this.isRequired = isRequired;
        this.expectedType = expectedType;
      }

      validate(value) {
        return getPreciseType(value) === this.expectedType;
      }
    })();
  }
  const validatorFunction = validate.bind(null, false);
  validatorFunction.isRequired = validate.bind(null, true);
  return validatorFunction;
}


let person = Types.objectOf({
  name: Types.string.isRequired,
  friends: Types.arrayOf(Types.number),
  address: Types.objectOf({
    one: Types.string.isRequired,
  }),
}).isRequired;

// api will be somethign like this

// intersect(person, _data) //should return an object with error, _cleanedup data
// console.log(person())

function intersect(type, data) {
  // here we rolll up the magic by cross matching eahc
  // create an object out of the magic
  // initialte the personTypeObject
  const typeObject = type();
  // now based on the types we switch here and there
  switch (typeObject.name) {
    case 'objectOf': {
      evaluateObjectOf(typeObject, data);
      break;
    }
    case 'arrayOf': {
      evaluateArrayOf(typeObject, data);
      break;
    }
    case 'string': {
      evaluateString(typeObject, data);
      break;
    }

    case 'number': {
      evaluateNumber(typeObject, data);
      break;
    }
    case 'boolean': {
      evaluateBoolean(typeObject, data);
      break;
    }
    default: {
      console.log('Something went wrong.');
      break;
    }
  }
}


function evaluateObjectOf(type, data) {
  // we know the type and the data contains the matches
  // iterate through the type and access the data

  if (type.isRequired && (data === undefined || data === null)) {
    throw new Error(`${'Object'} is required but not provided`);
  }
  Object.keys(type.plainObject).forEach((key) => {
    // get the value
    const value = data[key]
    
    // once we have the value then, we again call the intersect with the new value and the type
    intersect(type.plainObject[key], value)
  });
}

function evaluateArrayOf(type, data) {
  // we will iterate over the data
  if (type.isRequired && (data === undefined || data === null)) {
    throw new Error('list is required but not proviided');
  }
  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    intersect(type.typeChecker, value);
  }
}

function evaluateString(type, data) {
  if (type.isRequired && (data === undefined || data === null)) {
    throw new Error('String is required but not provided');
  }

  if (!(getPreciseType(data) === 'string')) {
    throw new Error(`String is expected but got ${getPreciseType(data)}`);
  }
}


function evaluateNumber(type, data) {
  if (type.isRequired && (data === undefined || data === null)) {
    throw new Error('Number is required but not provided');
  }

  if (!(getPreciseType(data) === 'number')) {
    throw new Error('Number is expected but got ' + getPreciseType(data));
  }
}

function evaluateBoolean(type, data) {
  if (type.isRequired && (data === undefined || data === null)) {
    throw new Error('Boolean is required but not provided');
  }

  if (!(getPreciseType(data) === 'boolean')) {
    throw new Error('Boolean is expected but got ' + getPreciseType(data));
  }
}

let data = {
  name: 'love',
  age: 23,
  friends: [2, 4, 2],
  address: {
    one: 'AS',
  },
};

intersect(person, data);