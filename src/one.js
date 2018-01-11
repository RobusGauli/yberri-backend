// const mongo = require('mongodb');

// const url = 'mongodb://localhost:27017';
// (async function test() {

//   const client = await mongo.connect(url);
//   const db = client.db('restaurant');
//   const collection = db.collection('tables');
//   //console.log(db);
//   const cursor = await collection.find({}, {projection: {tableName: true, _id: false}, skip: 2, limit: 2})
//   console.log( await cursor.toArray());
// })()


const func = predicate => value => predicate(value);

const isOdd = func(x => x % 2 != 0);

console.log(isOdd(3))
const getOdds = alist => alist.filter(isOdd);


console.log(getOdds([3,4,4,6]));
