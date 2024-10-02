'use strict';
const express = require('express');
const LikeController = require('../controllers/likeController');
const checkAuth = require('../middelware/checkAuth');
const router = express.Router();

router.use(['/like/:id', '/delete-like/:id'], checkAuth.verifyToken);
router.route('/like/:id')
  .post(LikeController.saveLike)
  .get(LikeController.checkLike);
router.delete('/delete-like/:id', LikeController.deleteLike);
router.get('/get-likes/:post', LikeController.getLikes);

module.exports = router;