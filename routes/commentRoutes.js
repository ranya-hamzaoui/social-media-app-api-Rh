'use strict';

const express = require('express');
const router = express.Router();
const checkAuth = require('../middelware/checkAuth'); 
const commentController  = require('../controllers/commentController')

router.post('/comments', checkAuth.verifyToken, commentController.createComment);
router.delete('/comments/:id', checkAuth.verifyToken, commentController.deleteComment);
//router.get('/comments/:postId', commentController.getComments);


module.exports = router;
