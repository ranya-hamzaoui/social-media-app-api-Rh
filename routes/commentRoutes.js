'use strict';

const express = require('express');
const router = express.Router();
const checkAuth = require('../middelware/checkAuth'); 
const commentController  = require('../controllers/commentController')

router.use(checkAuth.verifyToken);

router.post('/comments', commentController.createComment);
router.route('/comments/:id')
  .delete(commentController.deleteComment)
  .put(commentController.editComment);
  
module.exports = router;
