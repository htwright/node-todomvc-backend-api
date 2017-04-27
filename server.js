const express = require('express');
const bodyParser = require('body-parser');
const { DATABASE, PORT } = require('./config');
const app = express();
let server;
let knex;

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://chai-http.test');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Max-Age', '86400');
  res.header('location', 'trash');
  next();
});

app.get('/api/items', (req, res) => {
  knex('items').select().orderBy('id', 'desc').then((result)=>res.status(200).json(result));
});

app.post('/api/items', (req, res) => {
  knex('items').insert({title:req.body.title}).then(()=>res.status(201));
});

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
