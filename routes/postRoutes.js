'use strict';

const express = require('express');
const postController = require('../controllers/postController');
const router = express.Router();
const checkAuth = require('../middelware/checkAuth');

const postSchemaValidator = require('../shemaValidators/postValidator');

router.post('/posts',postSchemaValidator.createPostSchema,checkAuth.verifyToken ,postController.savePost);
router.get('/posts/:page',checkAuth.verifyToken,postController.getPosts);
router.get('/posts-user/:page',checkAuth.verifyToken, postController.getPostsConnectedUser);
router.get('/follow-posts/:page' ,checkAuth.verifyToken , postController.getPostsByFollows)


router.get('/getImageFile/:imageFile', postController.getImageFile);
router.delete('/posts/:id',checkAuth.verifyToken, postController.deletePost);
router.put('/posts/:imageFile', checkAuth.verifyToken, postController.editPost);
router.get('/posts/user-like/:page',checkAuth.verifyToken ,postController.getAllPostByLike);



module.exports = router;

