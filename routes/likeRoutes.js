'use strict';
const express = require('express');
const LikeController = require('../controllers/likeController');
var checkAuth = require('../middelware/checkAuth');
//Express Router
const router = express.Router();


router.post('/like/:id', checkAuth.verifyToken, LikeController.saveLike);
router.get('/like/:id', checkAuth.verifyToken, LikeController.checkLike);
router.delete('/delete-like/:id', checkAuth.verifyToken, LikeController.deleteLike);
router.get('/get-likes/:post', LikeController.getLikes);


module.exports = router;