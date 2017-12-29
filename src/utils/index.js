// const person = Type.Object({
//   name: Type.String.isRequired,
//   age : Type.number.isRequired,
//   address: Type.Object({
//     addressOne: Type.String,
//     addressTwo: Type.String
//   }),
//   friends: Type.ArrayOf(Type.String)
// })

//util fuction to get the type typeOf any value

//quirks typeof null --> "object" Booooooooya

function getPreciseType(value) {
  if(typeof value === undefined || value === null /*boo */ ){
    return '' + value; // --> "undefined" || "null"
  }

  const type = typeof value;
  //check for the object being array
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
}

module.exports = Types;


//here we will pass in the another type checker
function createArrayOfTypeChecker(typeChecker) {
  function validate(isRequired) {
    return new (class {
      constructor() {
        this.name = 'arrayOf'
        this.isRequired = isRequired;
        this.typeChecker = typeChecker
      }

      validate(value) {
        //here is the validation for the arrayof Type checker
        console.log('validation for the type chekcer')
      }
    })()
  }

  let _validate = validate.bind(null, false);
  _validate.isRequired = validate.bind(null, true);
  return _validate;
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
        //here is the validation for the arrayof Type checker
        console.log('validation for the type chekcer')
      }
    })()
  }
  let _validate = validate.bind(null, false);
  _validate.isRequired = validate.bind(null, true);
  return _validate;
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
        return getPreciseType(value) === expectedType;
      }
    })();
  }
  let _validate = validate.bind(null, false);
  _validate.isRequired = validate.bind(null, true);
  return _validate;
}


let person = Types.objectOf({
  name: Types.string.isRequired,
  friends: Types.arrayOf(Types.number),
  address: Types.objectOf({
    one: Types.string.isRequired,
  })
}).isRequired



let _data = {
  name : 'love',
  age: 23,
  friends: [2,4 ,2],
  address: {
    one: "asd"
  }
}


//api will be somethign like this

//intersect(person, _data) //should return an object with error, _cleanedup data
//console.log(person())

intersect(person, _data)
function intersect(type, data) {
  //here we rolll up the magic by cross matching eahc
  //create an object out of the magic
  
  //initialte the personTypeObject
  typeObject = type();
  //now based on the types we switch here and there
  switch(typeObject.name) {
    case 'objectOf': {
      return evaluateObjectOf(typeObject, data);
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
      console.log('error')
    }
  }
}


function evaluateObjectOf(type, data) {
  //we know the type and the data contains the matches
  //iterate through the type and access the data

  if (type.isRequired && (data === undefined || data === null)) {
    throw new Error(`${'Object'} is required but not provided`);
  }
  Object.keys(type.plainObject).forEach(key => {
    //get the value
    let value = data[key]
    
    //once we have the value then, we again call the intersect with the new value and the type
    intersect(type.plainObject[key], value)
  })
}

function evaluateArrayOf(type, data) {
  //we will iterate over the data
  if(type.isRequired && (data === undefined || data === null)) {
    throw new Error('list is required but not proviided');
  }
  for(let i = 0; i < data.length; i++) {
    let value = data[i];
    intersect(type.typeChecker, value);
  }
}

function evaluateString(type, data) {
  if(type.isRequired && (data === undefined || data === null)) {
    throw new Error('String is required but not provided');
  }

  if(! (getPreciseType(data) === 'string')) {
    throw new Error('String is expected but got ' + getPreciseType(data))
  }
}


function evaluateNumber(type, data) {
  if(type.isRequired && (data === undefined || data === null)) {
    throw new Error('Number is required but not provided');
  }

  if(!(getPreciseType(data) === 'number')) {
    throw new Error('Number is expected but got ' + getPreciseType(data));
  }
}

function evaluateBoolean(type, data) {
  if(type.isRequired && (data === undefined || data === null)) {
    throw new Error('Boolean is required but not provided');
  }

  if(!(getPreciseType(data) === 'boolean')) {
    throw new Error('Boolean is expected but got ' + getPreciseType(data));
  }
}
intersect(person, _data)