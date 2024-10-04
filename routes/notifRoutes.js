'use strict';
const express = require('express');
const notificationController = require('../controllers/notificationController');
const checkAuth = require('../middelware/checkAuth');
const router = express.Router();

router.use(checkAuth.verifyToken);

router.get('/notifications/:page/:perPage', notificationController.getNotifs);
module.exports = router;