const express = require('express');
const router = express.Router();

router.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://chai-http.test');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Max-Age', '86400');
  next();
});

module.exports = router;