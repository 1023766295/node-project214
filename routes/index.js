var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET users page. */
router.get('/users.html', function(req, res) {
  res.render('users', { title: 'Express' });
});

/* GET users page. */
router.get('/brand.html', function(req, res) {
  res.render('brand', { title: 'Express' });
});

/* GET users page. */
router.get('/phone.html', function(req, res) {
  res.render('phone', { title: 'Express' });
});

module.exports = router;
