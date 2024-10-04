const mongoose = require('mongoose');
require('dotenv').config();
mongoose.Promise = global.Promise; 
let MONGO_CONNECTION_URL= "mongodb+srv://rania:rania@clsecommerce.mmqgv.mongodb.net/clsEcommerce?retryWrites=true&w=majority"

const connectionUrl =  MONGO_CONNECTION_URL 

// const logger = require('../middelware/logger') 
const connectDB = async () => {
  try {
    await mongoose.connect(connectionUrl, {
    });
    console.log('database is connected')
  } catch (err) {
    console.error('connection failed hhhh ' + err);
  }
};

connectDB();
module.exports = mongoose;
