const express = require('express');
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');
const likeRoutes = require('./likeRoutes');
const followRoutes = require('./followRoutes');
const commentRoutes = require('./commentRoutes');

const router = express.Router();

router.use('/', userRoutes);
router.use('/', postRoutes);
router.use('', likeRoutes);
router.use('/', followRoutes);
router.use('/', commentRoutes);

module.exports = router;
