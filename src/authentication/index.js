// a authentication schemes 
const { Types } = require('../utils/types');
const jwt = require('jsonwebtoken');

const User = {
  collection: 'users',
  payloadType: Types.objectOf({
    userName: Types.string.isRequired,
    password: Types.string.isRequired,
  }),
};


// a registration handler for

async function registerUser(request, response) {
  const { db } = response;
  const { parsedBody } = request;
  console.log(parsedBody);
  const result = await db.collection('tables').find({}).toArray();
  console.log(result);
  response.jsonify({'love is': 'is in theair'});
}


module.exports = {
  registerUser,
  User,
}


