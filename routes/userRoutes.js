'use strict'

var express = require('express');
var userController = require('../controllers/userController');
var router = express.Router();
var checkAuth = require('../middelware/checkAuth');
var userValidator = require('../shemaValidators/userValidator');


router.post('/login',userValidator.loginSchema, userController.login);
router.post('/register',userValidator.registerSchema, userController.register);
router.get('/profile', checkAuth.verifyToken, userController.getProfile);
router.get('/users', checkAuth.verifyToken, userController.getAllUsers);
router.post('/refresh-token', checkAuth.verifyToken, userController.refreshToken);
router.post('/logout', checkAuth.verifyToken, userController.logout);




module.exports = router;