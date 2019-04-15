var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

var auth = jwt({
    secret: 'thisismysupersecret',
    userProperty: 'payload'
});

var ctrlAuth = require('../controllers/authentication');
var ctrlProfile = require('../controllers/profile');

// Authentication routes
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);


// Profile route
router.post('/profile', auth, ctrlProfile.profileRead)

module.exports = router;