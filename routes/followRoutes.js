'use strict';
const express = require('express');
const followController = require('../controllers/followController');
const checkAuth = require('../middelware/checkAuth');
const router = express.Router();

router.use(checkAuth.verifyToken);

router.post('/follow', followController.addFollow);
router.get('/following/:page', followController.getFollowingUsers);
router.get('/not-followed', followController.getunSubscribe);
router.delete('/unfollow/:id', followController.deleteFollow);
router.get('/followed/:page', followController.getFollowedUsers);
module.exports = router;