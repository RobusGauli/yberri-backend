const mongo = require('mongodb');

const url = 'mongodb://localhost:27017';
async function test() {

  const client = await mongo.connect(url);
  const db = client.db('restaurant');
  const collection = db.collection('tables');
  //console.log(db);
  //query , optiosn, 
  //const cursor = await collection.find({}, {projection: {tableName: true, _id: false}, skip: 2, limit: 2})
  
  const r = await collection.findOneAndUpdate({"tableName" : 'kingsss'}, {$set: {"tableNameInternal": 'baby'}}, {returnOriginal: false, projection: {tableName: true, tableNameInternal: true}});
  console.log(r.value);
  
  //console.log(r.toArray());
}

test();
