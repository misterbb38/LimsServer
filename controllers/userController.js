const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../middleware/async.js');
const User = require('../models/userModel'); // Ajustez le chemin selon votre structure
const Notification = require('../models/notificationModel.js')


const Counter = require('../models/Counter');


// Fonction pour obtenir le prochain identifiant séquentiel
async function getNextId(typeId) {
  const counter = await Counter.findByIdAndUpdate(typeId, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return counter.seq.toString(36).padStart(5, '0').toUpperCase();
}

// Middleware pour générer un token JWT

// Fonction pour générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Expiration dans 7 jours
  });
};

// Inscription d'un nouvel utilisateur
exports.signup = asyncHandler(async (req, res) => {
  const { nom, prenom, email, dateNaissance, password, adresse, telephone, userType, age } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ telephone });
  if (userExists) {
    res.status(400);
    throw new Error('Un utilisateur existe déjà avec cet telephone');
  }
  const nip = await getNextId('patientId'); // Générer l'identifiant
  // Créer un nouvel utilisateur
  const user = await User.create({
    nom,
    prenom,
    email,
    dateNaissance,
    password, // Sera hashé automatiquement par le hook pre 'save'
    adresse,
    telephone,
    age,
    nip,
    userType

  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      adresse: user.adresse,
      telephone: user.telephone,
      adresse: user.adresse,
      userType: user.userType,

      token: generateToken(user._id), // Envoi du token JWT pour authentification immédiate
    });
  } else {
    res.status(400);
    throw new Error('Données d\'utilisateur invalides');
  }
});

// // Connexion d'un utilisateur
exports.login = asyncHandler(async (req, res) => {
  const { password, nip } = req.body;

  // Trouver l'utilisateur par email
  const user = await User.findOne({ nip });

  // Vérifier le mot de passe et l'existence de l'utilisateur
  if (user && (await user.isCorrectPassword(password))) {
    // Vérifier si la clé d'accès est expirée

    res.json({
      _id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      adresse: user.adresse,
      telephone: user.telephone,
      adresse: user.adresse,
      devise: user.devise,
      userType: user.userType, // Envoyer le type d'utilisateur pour utilisation côté front
      logo: user.logo,
      token: generateToken(user._id), // Générer un nouveau token pour la session
    });

  } else {
    res.status(401);
    throw new Error('Email ou mot de passe invalide');
  }
});






// Obtenir le profil de l'utilisateur
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      adresse: user.adresse,
      telephone: user.telephone,
      adresse: user.adresse,
      userType: user.userType,
      logo: user.logo
    });
  } else {
    res.status(404);
    throw new Error('Utilisateur non trouvé.');
  }
});


// Modifier le profil de l'utilisateur
// exports.updateProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);

//   if (user) {
//     user.nom = req.body.nom || user.nom;
//     user.prenom = req.body.prenom || user.prenom;
//     user.email = req.body.email || user.email;
//     user.nomEntreprise = req.body.nomEntreprise || user.nomEntreprise;
//     user.adresse = req.body.adresse || user.adresse;
//     user.telephone = req.body.telephone || user.telephone
//     user.userType = req.body.userType || user.userType;

//     // Mettre à jour le logo seulement si un nouveau fichier a été uploadé
//     if (req.file) {
//       user.logo = req.file.path;
//     }
//     user.devise = req.body.devise || user.devise;

//     // Vérifiez si un nouveau mot de passe est fourni
//     if (req.body.password) {
//       // Hacher le nouveau mot de passe avant de le sauvegarder
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(req.body.password, salt);
//     }

//     const updatedUser = await user.save();

//     res.json({
//       _id: updatedUser._id,
//       nom: updatedUser.nom,
//       prenom: updatedUser.prenom,
//       email: updatedUser.email,
//       adresse: updatedUser.adresse,
//       telephone: updatedUser.telephone,
//       userType: updatedUser.userType,
//       token: generateToken(updatedUser._id), // Générer un nouveau token avec le profil mis à jour
//     });
//   } else {
//     res.status(404);
//     throw new Error('Utilisateur non trouvé.');
//   }
// });

exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  let { email, telephone, password, ...updateData } = req.body;

  // Récupérer l'utilisateur de la base de données
  const user = await User.findById(userId);

  // Si aucun utilisateur n'est trouvé, retourner une erreur
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé.' });
  }

  // Si un nouveau mot de passe est fourni, le hacher
  if (password) {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    updateData.password = password;
  }

  // Vérifier l'unicité de l'email et du téléphone s'ils sont modifiés
  if (email) {
    const emailExists = await User.findOne({ email, _id: { $ne: userId } });
    if (emailExists) {
      return res.status(400).json({ message: "L'email est déjà utilisé par un autre compte." });
    } else {
      updateData.email = email;
    }
  }

  if (telephone) {
    const telephoneExists = await User.findOne({ telephone, _id: { $ne: userId } });
    if (telephoneExists) {
      return res.status(400).json({ message: "Le téléphone est déjà utilisé par un autre compte." });
    } else {
      updateData.telephone = telephone;
    }
  }

  // Générer un NIP uniquement si l'utilisateur n'en a pas déjà un
  if (!user.nip) {
    const nip = await getNextId('patientId');
    updateData.nip = nip;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
    context: 'query' // Nécessaire pour les validations Mongoose sur update
  }).select('-password');

  if (updatedUser) {
    res.json({ success: true, data: updatedUser });
  } else {
    res.status(404).json({ message: 'Utilisateur non trouvé.' });
  }
});


// Modifier le profil de l'utilisateur
exports.updateProfileUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.nom = req.body.nom || user.nom;
    user.prenom = req.body.prenom || user.prenom;
    user.email = req.body.email || user.email;
    user.nomEntreprise = req.body.nomEntreprise || user.nomEntreprise;
    user.adresse = req.body.adresse || user.adresse;
    user.site = req.body.site || user.site;
    user.telephone = req.body.telephone || user.telephone;
    user.telephone = req.body.telephone || user.telephone;
    user.userType = req.body.userType || user.userType;
    user.devise = req.body.devise || user.devise;
    user.couleur = req.body.couleur || user.couleur;

    // Mettre à jour le logo seulement si un nouveau fichier a été uploadé
    if (req.file) {
      user.logo = req.file.path;
    }
    user.devise = req.body.devise || user.devise;

    // Vérifiez si un nouveau mot de passe est fourni
    if (req.body.password) {
      // Hacher le nouveau mot de passe avant de le sauvegarder
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      nom: updatedUser.nom,
      prenom: updatedUser.prenom,
      email: updatedUser.email,
      adresse: updatedUser.adresse,
      telephone: updatedUser.telephone,
      userType: updatedUser.userType,
      logo: updatedUser.logo, // Assurez-vous que votre client gère correctement le chemin du fichier
      devise: updatedUser.devise,
      token: generateToken(updatedUser._id), // Générer un nouveau token avec le profil mis à jour
    });
  } else {
    res.status(404);
    throw new Error('Utilisateur non trouvé.');
  }
});


// Obtenir un utilisateur par ID
// exports.getUserById = asyncHandler(async (req, res) => {


//   const user = await User.findById(req.params._id).select('-password'); // Exclure le mot de passe du résultat

//   if (user) {
//     res.json({ success: true, data: user, message: 'utilisateur existe' });
//   } else {
//     res.status(404).json({ message: 'Utilisateur non trouvé.' });
//   }
// });

exports.getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id; // Récupérer l'ID de l'utilisateur à partir des paramètres de la route

  const user = await User.findById(userId).select('-password'); // Exclure le mot de passe du résultat

  if (user) {
    res.json({ success: true, data: user, message: 'Utilisateur trouvé.' });
  } else {
    res.status(404).json({ message: 'Utilisateur non trouvé.' });
  }
});



exports.deleteUser = asyncHandler(async (req, res) => {
  // Recherche et suppression du test par son ID
  const test = await User.findByIdAndDelete(req.params.id);

  // Si aucun user trouvé, renvoyer une erreur 404
  if (!test) {
    res.status(404);
    throw new Error(`User non trouvé avec l'ID ${req.params.id}`);
  }

  // Réponse confirmant la suppression
  res.status(200).json({ success: true, data: {}, message: 'user supprimer' });
});



// exports.assignAccessKey = asyncHandler(async (req, res) => {



// Obtenir tous les utilisateurs de type patient
exports.getSimpleUsers = asyncHandler(async (req, res) => {
  const simpleUsers = await User.find({ userType: 'patient' }).select('-password');
  res.status(200).json({ success: true, data: simpleUsers });
});

// Obtenir tous les utilisateurs de type non patient

exports.getNonPatientUsers = asyncHandler(async (req, res) => {
  const nonPatientUsers = await User.find({ userType: { $ne: 'patient' } }).select('-password');
  res.status(200).json({ success: true, data: nonPatientUsers });
});


exports.getPatientStatistics = asyncHandler(async (req, res) => {
  const { year } = req.params;

  // Filtre de base pour les patients
  let filter = { userType: 'patient' };

  // Ajouter le filtre par année si spécifié
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    filter.$and = [
      { createdAt: { $gte: startDate } },
      { createdAt: { $lte: endDate } }
    ];
  }

  // Calculer l'âge basé sur la date de naissance ou l'âge directement
  const currentDate = new Date();
  const patients = await User.aggregate([
    { $match: filter },
    {
      $project: {
        ageCalculated: {
          $cond: {
            if: "$age",
            then: "$age",
            else: {
              $floor: {
                $divide: [
                  { $subtract: [currentDate, "$dateNaissance"] },
                  (365 * 24 * 60 * 60 * 1000) // Nombre de millisecondes par an
                ]
              }
            }
          }
        },
        sexe: 1
      }
    },
    {
      $facet: {
        total: [{ $count: "totalPatients" }],
        males: [
          { $match: { sexe: "homme" } },
          { $count: "maleCount" }
        ],
        females: [
          { $match: { sexe: "femme" } },
          { $count: "femaleCount" }
        ],
        minors: [
          { $match: { ageCalculated: { $lt: 15 } } },
          { $count: "minorsCount" }
        ]
      }
    }
  ]);

  // Vérifier si les données existent pour éviter les erreurs
  const stats = patients[0] || { total: [], males: [], females: [], minors: [] };

  res.status(200).json({
    totalPatients: stats.total[0]?.totalPatients || 0,
    maleCount: stats.males[0]?.maleCount || 0,
    femaleCount: stats.females[0]?.femaleCount || 0,
    minorsCount: stats.minors[0]?.minorsCount || 0,
  });
});
