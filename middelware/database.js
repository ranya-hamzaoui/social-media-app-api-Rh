const mongoose = require('mongoose');
mongoose.Promise = global.Promise; 

const connectionUrl = process.env.MONGO_CONNECTION_URL 
// || 'mongodb://127.0.0.1:27017/socialDb';

const connectDB = async () => {
  try {
    await mongoose.connect(connectionUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log('db is connected');
  } catch (err) {
    console.error('connection failed hhhh ' + err);
  }
};

connectDB();
module.exports = mongoose;
