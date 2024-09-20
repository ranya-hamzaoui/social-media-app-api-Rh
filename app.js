'use strict'; // Active le mode strict en JavaScript, qui aide à éviter certaines erreurs silencieuses.
const path =  require('path');
const express = require('express');
const cookieParser = require("cookie-parser"); // Gère les cookies HTTP.
const compression = require("compression"); // Middleware pour compresser les réponses HTTP.
const helmet = require("helmet"); // Middleware pour sécuriser Express en paramétrant divers en-têtes HTTP.
const cors = require("cors"); // Permet les requêtes cross-origin (CORS).
//const logger = require("morgan"); // Middleware pour le logging des requêtes HTTP.
const boom = require("boom"); // Gère les erreurs HTTP avec des objets spécifiques.
const winston = require("winston"); // Librairie pour le logging avancé.
const {ErrorHandle} = require('./middelware/errorHandle') // Gestionnaire d'erreurs personnalisé.
const db = require('./middelware/database') // Middleware pour la connexion à la base de données.
const config=  require('./config/server'); // Configuration du serveur (par exemple, le header "poweredBy").
// const logger = require('./middelware/logger'); // Middleware pour le logging des requêtes HTTP.
require('dotenv').config();
// Chargement des routes à partir du dossier routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
var likeRoutes = require('./routes/likeRoutes');
var followRoutes = require('./routes/followRoutes');
const commentRoutes = require('./routes/commentRoutes');

var app = express(); // Initialisation de l'application Express.

// Configuration du moteur de vue
app.set("views", path.join(__dirname, "views")); // Définit le dossier des vues.
app.set("view engine", "hbs"); // Définit "hbs" comme moteur de rendu des vues.

// app.use(
//   logger("dev", {
//     stream: winston.stream
//   })
// );

// Ajoute des en-têtes de sécurité HTTP avec Helmet
app.use(
  helmet({
    hidePoweredBy: {
      setTo: config.poweredBy // Cache la technologie utilisée dans l'en-tête "X-Powered-By".
    }
  })
);
app.use(cors());

app.use(cors()); // Active les CORS pour permettre les requêtes d'autres domaines.
app.use(express.json()); // Parse le corps des requêtes JSON.
app.use(compression()); // Compresse les réponses HTTP pour améliorer les performances.
app.use(
  express.urlencoded({
    extended: false // Parse les corps des requêtes URL-encoded (par exemple, les formulaires).
  })
);
app.use(cookieParser()); // Parse les cookies des requêtes entrantes.
app.use('/', express.static(path.join(__dirname, "public"))); // Sert les fichiers statiques (CSS, images, etc.) depuis le dossier "public".

// Middleware personnalisé qui ne fait rien ici, mais peut être utile pour loguer ou gérer chaque requête.
app.use(function(req, res, next) {
  next(); // Passe au middleware suivant.
});


// Configuration pour faire confiance au proxy (si l'application est derrière un proxy)
app.enable("trust proxy"); // Active la confiance dans les en-têtes proxy.
app.set("trust proxy", 1); // Définit qu'il y a un seul proxy entre l'utilisateur et l'app.


// Configuration des headers CORS pour gérer les requêtes cross-origin
app.use((req, res, next) => { 
  res.setHeader("Access-Control-Allow-Origin", "*"); // Specify the exact origin if using credentials
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization,application/json");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  // res.setHeader("Access-Control-Allow-Credentials", "true"); // Enable credentials
  next();
});


app.get('/api/getImageFile/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = `./uploads/${filename}`; // Adjust this to your file path
  res.sendFile(filePath, { root: __dirname });
});

// Définition des routes de l'application
app.use('/api', userRoutes); 
app.use('/api', postRoutes);
app.use('/api', followRoutes);
app.use('/api', likeRoutes);
app.use('/api/users', userRoutes);
app.use('/api', commentRoutes);

// Gestion des erreurs 404 (non trouvé), si activé
// app.use(function(req, res, next) {
//   console.log('not found') // Log des erreurs 404.
//   next(boom.notFound()); // Envoie une erreur 404 via boom.
// });

// Gestion des erreurs de l'application
app.use(ErrorHandle);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // logger.debug(`Server running on port ${PORT}`);
});

// Exports et configuration pour rendre l'application accessible en tant que module.
// module.exports = app
