const mongoose = require('mongoose');
require('dotenv').config();
mongoose.Promise = global.Promise; 
const connectionUrl =   process.env.MONGO_CONNECTION_URL 
// const logger = require('../middelware/logger') 
const connectDB = async () => {
  try {
    await mongoose.connect(connectionUrl, {
    });
    // logger.info('database is connected')
  } catch (err) {
    console.error('connection failed hhhh ' + err);
  }
};

connectDB();
module.exports = mongoose;
