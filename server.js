const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const colors = require('colors');
const cors = require('cors'); // Importer cors
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

const app = express(); // Initialisation de l'app Express

app.use(cors());
// app.use(cors({
//     origin: 'https://hist-front-app.onrender.com', // Autoriser seulement cette origine à accéder à l'API
// }));


// Body parser pour lire les données du corps de la requête
app.use(express.json());

// Middleware de logging pour le développement
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
const historique = require('./routes/historiqueRoutes');
const analyse = require('./routes/analyseRoutes');
const user = require('./routes/userRoutes');
const notification = require('./routes/notificationRoutes');
const testRoutes = require('./routes/testRoutes'); // Mettez à jour le chemin selon votre structure de fichiers
const partenaire = require('./routes/partenaireRoutes');
const etipartenaire = require('./routes/etiquettePartenaireRoutes');
const resultatRoutes = require('./routes/resultatRoutes');


// Monter les routeurs
app.use('/api/resultats', resultatRoutes);
app.use('/api/hist', historique);
app.use('/api/analyse', analyse);
app.use('/api/user', user);
app.use('/api/partenaire', partenaire);
app.use('/api/eti', etipartenaire);
app.use('/api/notification', notification);
app.use('/api/test', testRoutes);
app.use('/ordonnances', express.static('ordonnances'));
app.use('/ordonnances', express.static(path.join(__dirname, 'ordonnances')));
app.use('/uploads', express.static('uploads'));



// Correction pour définir une route racine
app.get('/', function (req, res) {
    return res.status(200).json({ message: 'Welcome to the API' });
});


// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Le serveur écoute sur le port ${PORT} et fonctionne en mode ${process.env.NODE_ENV}`.yellow.bold.underline);
});
