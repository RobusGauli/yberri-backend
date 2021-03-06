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

const jsonValidate = (typeObject, jsonData) => {
  const message = typeObject().validate(jsonData);
  const spec = typeObject().getJsonSpec();
  const success = typeObject().checkSuccess(message);

  return {
    message,
    spec,
    success,
  }
}
module.exports = { Types, jsonValidate };


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
        if (this.isRequired === true && (value === undefined || value === null)) {
          return `Array[] of type ${this.typeChecker().name} is required but not provided.`;
        }
        // we here have to go through each list
        if (value === undefined || value === null) {
          return `Warning ${value} was passed instead of array of type ${this.typeChecker().name}.`;
        }
        // if object that is not iterable is provided
        if (!Array.isArray(value)) {
          // not iterable
          return `Warning! value of type ${getPreciseType(value)} was passed instead of array of type ${this.typeChecker().name}`;
        }
        const result = [];
        value.forEach((item) => {
          // here we go through the list and apply
          result.push(this.typeChecker().validate(item)); 
        });
        return result;
      }

      getJsonSpec() {
        if (this.typeChecker === null || this.typeChecker === undefined) {
          throw new Error('Cannot provide specification for non type Array');
        }
        return [`${this.typeChecker().getJsonSpec()}`];
      }

      checkSuccess(value) {
        return value.reduce((acc, item) => {
          const typeInstance = this.typeChecker();
          return acc && (typeInstance.checkSuccess(item) || !this.isRequired);
        }, true);
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
        this.name = 'objectOf';
        this.isRequired = isRequired;
        this.plainObject = plainObject;
      }

      validate(value) {
        // here is the validation for the arrayof Type checker
        // first check if it is required
        if (this.isRequired) {
          // we require the value
          if (!(typeof value === 'object' && value !== null)) {
            return 'Object is required but not provided.';
          }
        }
        if (value === null || value === undefined || !typeof value === 'object') {
          return 'Warning! Object is not provided';
        }
        if (this.plainObject === undefined || this.plainObject === null) {
          throw new Error(`Cannot validate on ${this.plainObject}.`);
        }
        const result = {};
        Object.entries(this.plainObject)
          .forEach(([key, val]) => {
            // get the value of the data
            const valueOfData = value[key];
            result[key] = val().validate(valueOfData);
          });
        return result;
      }

      getJsonSpec() {
        // provide the specification
        const specification = {};
        if (this.plainObject === undefined || this.plainObject === null) {
          throw new Error('Cannot Provide specification for empty Object');
        }
        Object.entries(this.plainObject).forEach(([key, value]) => { 
          specification[key] = value().getJsonSpec();
        });
        return specification;
      }

      checkSuccess(value) {
        return Object.entries(this.plainObject).reduce((acc, [key, val]) => {
          const data = value[key];
          const typeInstance = val();
          return acc && (typeInstance.checkSuccess(data) || !typeInstance.isRequired);
        }, true);
      }
    })();
  }
  const validatorFunction = validate.bind(null, false);
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
        // here we have list of string , bool and many more
        if (this.isRequired && (value === undefined || value === null)) {
          return `Value of type ${this.expectedType} is required but not provided.`;
        }
        if (getPreciseType(value) === this.expectedType) {
          return 'Success';
        }
        return `Warning value of type ${getPreciseType(value)} was passed instead of type ${this.expectedType}`;
      }

      getJsonSpec() {
        return `${this.expectedType}`;
      }

      checkSuccess(value) {
        return value === 'Success' || !this.isRequired;
      }
    })();
  }
  const validatorFunction = validate.bind(null, false);
  validatorFunction.isRequired = validate.bind(null, true);
  return validatorFunction;
}


// const data = {
//   name: true,
//   age: 1,
//   friends: [1,2,3,4,5],
//   adrress: {
//     one: "ASd",
//   },
//   person: {
//     love: 3,
//     call: 'loe is there'
//   }
// };


// const person = Types.objectOf({
//   call: Types.string.isRequired,
//   love: Types.number,
// })

// const  an = Types.objectOf({
//   name: Types.bool.isRequired,
//   friends: Types.arrayOf(Types.number.isRequired).isRequired,
//   age: Types.number,
//   adrress: Types.objectOf({
//     one: Types.string.isRequired,
//   }),
// });


// const result = jsonValidate(an, data);
// console.log(result);

