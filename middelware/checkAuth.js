const jwt = require('jsonwebtoken');
const  config = require('../config/configToken.json'); 
const  { errors_messages } = require('./../constants/errors_messages');
const { ResponseRender } = require("../helpers/glocal-functions");


 function verifyToken(req, res, next) {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
 
    if (!token) return res.status(403).send(ResponseRender(403, errors_messages.UNAUTHORIZED,{ message: 'No token provided.' }))

    jwt.verify(token, config.TOKEN_SECRET_KEY, function(err, decoded) {
        if (err)  res.status(401).send(ResponseRender(401, errors_messages.FORRBIDEN,{ message: 'Failed to authenticate token.' }))        
        req.sub = decoded.user;
        next();
    });
}

module.exports= {verifyToken}




