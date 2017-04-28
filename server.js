const express = require('express');
const bodyParser = require('body-parser');
const { DATABASE, PORT } = require('./config');
const app = express();
let server;
let knex;

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Max-Age', '86400');
  next();
});

app.get('/api/items', (req, res) => {
  knex('items').select().then((result)=>res.status(200).json(result));

});

app.get('/api/items/:id', (req, res) => {
  let {id} = req.params;
  knex('items').select().where('id', id).then((result)=>res.status(200).json(result[0]));
});

app.post('/api/items', (req, res) => {
  const requiredFields = ['title'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      return res.status(400)
				.send(message);
    }
  }
		//http://chai-http.testc
  knex('items').insert({title: req.body.title}).returning(['id', 'title', 'completed', 'url'])
    .then(function(result){
      result[0].url = `http://localhost:8080/api/items/${result[0].id}`;
      res.header('location', result[0].url);
      return knex('items').where('id', result[0].id).update('url' ,result[0].url).returning(['id', 'title', 'completed', 'url']);
    })
    // .then(result => {
    //   knex('items')
    //   .update('url', result[0].url)
    //   .returning(['id', 'title', 'completed', 'url'])

    // })
      .then(result =>res.status(201).json(result))
});

app.put('/api/items/:id', (req, res) => {
  if ('title' in req.body){

    knex('items')
    .where('id', req.params.id)
    .update('title', req.body.title)
    .returning(['id', 'title'])
    .then((result) => {
      res.json(result[0]);
    });
  } else{
    knex('items')
		.where('id', req.params.id)
		.update('completed', 'true')
		.returning(['completed', 'title', 'id'])
		.then((response) => res.json(response[0]));
  }
});
app.delete('/api/items/:id', (req, res) => {
  knex('items').where('id', req.params.id).delete().then(resp => res.json(resp));
})


function runServer(database = DATABASE, port = PORT) {
  return new Promise((resolve, reject) => {
    try {
      knex = require('knex')(database);
      server = app.listen(port, () => {
        console.info(`App listening on port ${server.address().port}`);
        resolve();
      });
    }
    catch (err) {
      console.error(`Can't start server: ${err}`);
      reject(err);
    }
  });
}

function closeServer() {
  return knex.destroy().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing servers');
      server.close(err => {
        if (err) {
            return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => {
    console.error(`Can't start server: ${err}`);
    throw err;
  });
}

module.exports = { app, runServer, closeServer };
