const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
router.use(bodyParser.json());

const { DATABASE, PORT } = require('./config');

let knex = require('knex')(DATABASE);

router.get('/', (req, res) => {
  knex('items').select().then((result)=>res.status(200).json(result));

});

router.get('/:id', (req, res) => {
  let {id} = req.params;
  knex('items').select().where('id', id).then((result)=>res.status(200).json(result[0]));
});

router.post('/', (req, res) => {
  const requiredFields = ['title'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      return res.status(400)
				.send(message);
    }
  }
		
  knex('items').insert({title: req.body.title}).returning(['id', 'title', 'completed', 'url'])
    .then(function(result){
      result[0].url = `http://localhost:8080/api/items/${result[0].id}`;
      res.header('location', result[0].url);
      return knex('items').where('id', result[0].id).update('url' ,result[0].url).returning(['id', 'title', 'completed', 'url']);
    })
    .then(result =>res.status(201).json(result[0]));
});

router.put('/:id', (req, res) => {
  console.log(req.body);
  knex('items')
  .where('id', req.params.id)
  .update({title: req.body.title, completed: req.body.completed})
   .returning(['id', 'title', 'completed'])
  .then((result) => {
    res.json(result[0]);
  });
});

router.delete('/:id', (req, res) => {
  knex('items').where('id', req.params.id).delete().then(resp => res.json(resp));
});


module.exports = router;

