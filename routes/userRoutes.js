'use strict'
const express = require('express');
const userController = require('../controllers/userController');
const checkAuth = require('../middelware/checkAuth');
const userValidator = require('../shemaValidators/userValidator');
const upload = require('../helpers/upload')
const router = express.Router();

function checkAuthExceptLogin(req, res, next) {
    if (req.path === '/register' || req.path === '/login') {
        return next();
    }
    return checkAuth.verifyToken(req, res, next);
}
router.use(checkAuthExceptLogin);

router.post('/register', userController.register);
router.post('/login',userValidator.loginSchema, userController.login);
router.get('/profile',  userController.getProfile);
router.get('/profile/:id',  userController.getProfile);
router.get('/users',  userController.getAllUsers);
router.post('/refresh-token',  userController.refreshToken);
router.post('/logout',  userController.logout);
router.put('/updatePicture',upload.single('picture'),userController.editProfile)
router.put('/editinfo',userController.editInfo)


module.exports = router;