
async function createTable(request, response) {

  const { body, db } = response;
  if (body) {
    // if there is body
    let parsed = JSON.parse(body);
  }
  response.jsonify({
    name: 'rpbu',
  });
}

module.exports = {
  createTable,
}