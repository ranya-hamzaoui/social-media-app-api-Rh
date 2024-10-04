const dotenv = require('dotenv');
const path = require('path')
dotenv.config();

const Server  = {
  env: process.env.NODE_ENV || 'development',
  protocol: 'http',
  host: 'localhost',
  poweredBy: process.env.POWERED_BY,
  nodeEnv: process.env.NODE_ENV,
  port: +process.env.PORT,
  debugLogging: process.env.NODE_ENV == "development",
  logsDir: path.join('./tmp', "logs"),
  port: process.env.PORT || 3004,
  certificates: {
    //todo put certifications path here
  }
};

module.exports = Server
