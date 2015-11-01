var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Texas Method' });
});

router.post('/register', function(req, res, next) {
  Account.register(new Account({ username : req.body.username }), req.body.password, function(err) {
    if (err) return res.status(500).json({err: err});
    passport.authenticate('local')(req, res, function () {
      return res.status(200).json({status: 'Registration successful!'});
    });

  });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) return res.status(401).json({err: info});
    req.logIn(user, function(err) {
      if (err) return res.status(500).json({err: 'Could not log in user'});
      res.status(200).json({status: 'Login successful!'});
    });
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.status(200).json({status: 'Bye!'})
});


function isAuthenticated (req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects

  //allow all get request methods
  if(req.method === "GET"){
    return next();
  }
  if (req.isAuthenticated()){
    return next();
  }

  // if the user is not authenticated then redirect him to the login page
  return res.redirect('/#/login');
}
//router.use('/', isAuthenticated);

module.exports = router;
