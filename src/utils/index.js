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

//here we will pass in the another type checker
function createArrayOfTypeChecker(typeChecker) {
  function validate(isRequired) {
    return new (class {
      constructor() {
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
  age: Types.number,
  friends: Types.arrayOf(Types.number),
  address: Types.objectOf({
    one: Types.string.isRequired,
  })
}).isRequired

let _data = {
  name: 'robus',
  age: 23,
  friends: [3,4 , 5],
  address: {
    one: 'address'
  }
}


//api will be somethign like this

//intersect(person, _data) //should return an object with error, _cleanedup data
console.log(person())
