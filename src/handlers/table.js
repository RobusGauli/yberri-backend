
//const Task = require('data.task');
//handler function for tables
async function createTable(request, response) {
  //here we take the body of the resposne parse it and then we are done
  const { body, db } = response;
  if (body) {
    //if there is body
    let parsed = JSON.parse(body);
  }
  response.jsonify({
    name: 'rpbu'
  })
}

module.exports = {
  createTable,
}