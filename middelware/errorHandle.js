const boom = require("boom");
// const winston = require("./logger");
const { ResponseRender } = require("../helpers/glocal-functions");

function ErrorHandle (err, req, res, next) {
    if (!err.isBoom) {
      boom.boomify(err);
    }
    if (err.isServer) {
      winston.error(err, {
        service: 'APP'
      });
    }
    return res.status(err.output.statusCode).json(ResponseRender(err.output.statusCode,err.output.payload.error,err.output.payload.message));    
  }
  module.exports ={ErrorHandle}