'use strict';
const express = require('express');
const followController = require('../controllers/followController');
const checkAuth = require('../middelware/checkAuth');
const router = express.Router();


router.post('/follow',checkAuth.verifyToken, followController.addFollow);
router.get('/follow/:page',checkAuth.verifyToken, followController.getFollowingUsers);
router.get('/followed-user/:page',checkAuth.verifyToken, followController.getFollows);
router.get('/not-followed',checkAuth.verifyToken, followController.getunSubscribe);

module.exports = router;