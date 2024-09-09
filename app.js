'use strict';
const path =  require('path');
const express = require('express');
const cookieParser = require("cookie-parser");
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors");
const logger = require("morgan");
const boom = require("boom");
const winston = require("winston");
const {ErrorHandle} = require('./middelware/errorHandle')
const db = require('./middelware/database')
const config=  require('./config/server');

//Load routes from routes folder
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
var likeRoutes = require('./routes/likeRoutes');
var followRoutes = require('./routes/followRoutes');
const commentRoutes = require('./routes/commentRoutes');

var app = express();


// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// app.use(
//   logger("dev", {
//     stream: winston.stream
//   })
// );
app.use(
  helmet({
    hidePoweredBy: {
      setTo: config.poweredBy
    }
  })
);
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(cookieParser());
app.use('/',express.static(path.join(__dirname, "public")));

app.use(function(req, res, next) {
  next();
});

// setup app routes
app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', followRoutes);
app.use('/api', likeRoutes);
app.use('/api/users', userRoutes);
app.use('/api', commentRoutes);



app.enable("trust proxy");
app.set("trust proxy", 1);

//CORS Headers Configuration
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, application/json");


  next();
});

//catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   console.log('not found')
//   next(boom.notFound());

// });

// error handler
app.use(ErrorHandle);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Exports and set www as main class 
//module.exports = app