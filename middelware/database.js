const mongoose = require('mongoose');
require('dotenv').config();
mongoose.Promise = global.Promise; 
const connectionUrl = 'mongodb://127.0.0.1:27017/socialDb';
// || process.env.MONGO_CONNECTION_URL  
const logger = require('../middelware/logger') 
const connectDB = async () => {
  try {
    await mongoose.connect(connectionUrl, {
    });
    // logger.info('db is connected')
  } catch (err) {
    console.error('connection failed hhhh ' + err);
  }
};

connectDB();
module.exports = mongoose;
