// a authentication schemes
const envelop = require('../utils/envelop');
const { Types } = require('../utils/types');
const jwt = require('jsonwebtoken');
const { parseAndCheckJsonType } = require('../decorators');
const bcrypt = require('bcrypt');
const { MongoError } = require('mongodb');
const error = require('./error');


const SALT_ROUNDS = 10; // default

// db setting
const COLLECTION_NAME = 'users';

// jwt setting
const JWT_SECRET = 'YBERRIWILLROCKTHEFLOOR';
const ALGORITHM = 'HS256';
const EXPIRY = '7d';

function generateJwt(userName) {
  const payload = {
    userName,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRY, algorithm: ALGORITHM });
  return token;
};

const RegisterPayload = Types.objectOf({
  userName: Types.string.isRequired,
  password: Types.string.isRequired,
  firstName: Types.string.isRequired,
  middleName: Types.string,
  lastName: Types.string.isRequired,
});

const LoginPayload = Types.objectOf({
  userName: Types.string.isRequired,
  password: Types.string.isRequired,
});

const User = {
  collection: 'users',
  payloadType: Types.objectOf({
    userName: Types.string.isRequired,
    password: Types.string.isRequired,
    firstName: Types.string.isRequired,
    middleName: Types.string,
    lastName: Types.string.isRequired,
  }),
  index: {
    fields: ['userName'],
    unique: true,
  },
};

const successfullRegisterData = (
  userName,
  firstName,
  lastName,
  middleName,
) => ({
  userName,
  firstName,
  lastName,
  middleName,
});

const successfullLoginData = (
  userName,
  firstName,
  lastName,
  middleName,
  token,
) => ({
  userName,
  firstName,
  lastName,
  middleName,
  token,
});


// a registration handler for

async function registerUser(request, response) {
  const { db } = response;
  const { parsedBody } = request;
  const {
    userName,
    password,
    firstName,
    lastName,
    middleName,
  } = parsedBody;

  // hash the password sha256
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  // now store the info to db
  const collection = db.collection(COLLECTION_NAME);
  // fieilds
  collection.createIndex(
    { userName: 1 },
    { unique: true },
  );
  const document = Object.entries(parsedBody).reduce((acc, [key, val]) =>
    ({ ...acc, [key]: val.trim() }), {});
  document.password = hashedPassword;
  try {
    await collection.insertOne(document);
    response.jsonify(envelop.dataEnvelop(
      successfullRegisterData(userName, firstName, lastName, middleName),
      'Successfully Registered',
    ));
  } catch (_error) {
    if (_error instanceof MongoError) {
      response.badRequestError(error.userAlreadyRegistered);
    } else {
      response.internalServerError(envelop.unknownError());
    }
  }
}

async function loginUser(request, response) {
  const { db } = response;
  const { parsedBody } = request;
  const { userName, password } = parsedBody;

  // filter
  const filter = {
    userName,
  };
  // get the credentials for the user
  try {
    const doc = await db.collection(COLLECTION_NAME).findOne(filter);
    if (doc === null) {
      // username does not match any account
      response.badRequestError(error.userNotFoundError);
    } else {
      // if there is a document then, grab the password
      const { password : hashedPassword } = doc;
      const match = await bcrypt.compare(password, hashedPassword || '');
      if (match) {
        response.jsonify(envelop.dataEnvelop(
          successfullLoginData(
            doc.userName,
            doc.firstName,
            doc.lastName,
            doc.middleName,
            generateJwt(doc.userName),
          ),
          'Login Successfull',
        ));
      } else {
        response.badRequestError(error.usernameOrPasswordNotMatch);
      }
    }
  } catch (_error) {
    console.log(_error);
    response.internalServerError(envelop.unknownError());
  }

}

registerUser = parseAndCheckJsonType(registerUser, RegisterPayload);

loginUser = parseAndCheckJsonType(loginUser, LoginPayload);

module.exports = {
  registerUser,
  loginUser,
  User,
  JWT_SECRET,
};
