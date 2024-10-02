'use strict';

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const checkAuth = require('../middelware/checkAuth');
const postSchemaValidator = require('../shemaValidators/postValidator');

router.use(checkAuth.verifyToken);

router.post('/posts',postController.savePost);
router.delete('/posts/:id',postController.deletePost);
router.put('/posts/:imageFile',postController.editPost);

router.get('/posts/:page',postController.getPosts); // list of all posts
router.get('/posts-user/:page', postController.getConnectUserPost); // list of all posts of connected user
router.get('/posts-follow/:page',postController.getPostsByFollows) // list of all posts of followers user
router.get('/posts-like/:page',postController.getAllPostwithLike); // list of all posts with like/dislike connect user

module.exports = router;

