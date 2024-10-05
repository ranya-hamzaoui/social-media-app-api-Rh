'use strict'; 
const path =  require('path');
const express = require('express');
const cookieParser = require("cookie-parser"); 
const compression = require("compression"); 
const helmet = require("helmet"); 
const cors = require("cors"); 
const boom = require("boom"); 


// var winston = require("./middelware/logger");
var morgan = require("morgan");

const {ErrorHandle} = require('./middelware/errorHandle') 
const db = require('./middelware/database') 
const config=  require('./config/server');
require('dotenv').config();

const routes = require('./routes/index');
const upload = require('./helpers/upload');

var app = express(); 

app.set("views", path.join(__dirname, "views")); 
app.set("view engine", "hbs");


// app.use(
//   logger("dev", {
//     stream: winston.stream
//   })
// );

app.use(morgan('combined')); // journalisation dans la console sans fichier de logs
app.use(helmet({}));
app.use(cors()); 
app.use(express.json()); 
app.use(compression()); 
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, "public")));

app.use(function(req, res, next) {
  next(); 
});


app.enable("trust proxy"); 
app.set("trust proxy", 1);

app.use((req, res, next) => { 
  res.setHeader("Access-Control-Allow-Origin", "*"); // Specify the exact origin if using credentials
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization,application/json");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});


app.get('/api/getImageFile/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = `./uploads/${filename}`; // Adjust this to your file path
  res.sendFile(filePath, { root: __dirname });
});

app.get('/api/upload',upload.single('file'), (req, res) => {
  const filename = req.params.filename;
  console.log('file',req.file.originalname)
  res.json( { 'root': filename });
});

app.use('/api', routes); 

app.use(function(req, res, next) {
  next(boom.notFound()); 
});
app.use(ErrorHandle);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// module.exports = app
