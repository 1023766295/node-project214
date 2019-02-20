var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET login page. */
router.get('/login.html', function(req, res, next) {
  res.render('login');
});

/* GET brand page. */
router.get('/brand.html', function(req, res) {
  res.render('brand', { title: 'Express' });
});

/* GET phone page. */
router.get('/phone.html', function(req, res) {
  res.render('phone', { title: 'Express' });
});

/* GET register page. */
router.get('/register.html', function(req, res) {
  res.render('register', { title: 'Express' });
});

module.exports = router;
