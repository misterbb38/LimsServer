const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid'); // Assurez-vous d'installer le package nanoid si ce n'est pas déjà fait

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis'],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,

  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
  },
  adresse: {
    type: String,
  },
  telephone: {
    type: String,
    unique: true,
  },
  logo: {
    type: String,
  },
  devise: {
    type: String,
    required: [true, 'La devise est requise'],
    default: 'Fcfa',
  },
  userType: {
    type: String,
    enum: ['patient', 'superadmin', 'medecin', 'technicien', 'preleveur', 'accueil', 'partenaire'],
    default: 'patient',
  },
  partenaireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partenaire',
  },
  dateNaissance: {
    type: Date,
    required: [false, 'La date de naissance est requise'],
  },
  age: {
    type: Number,

  },
  identifiant: {
    type: String,
    required: [true],
    unique: true,
    default: () => nanoid(),
  },
  nip: {
    type: String,
    unique: true,
    required: true
  },
  nomEntreprise: {
    type: String,
    default: "Nom entreprise",
  },
  sexe: {
    type: String,
    enum: ['femme', 'homme']
  },
  couleur: {
    type: String,
    default: "blue",
  },
}, { timestamps: true });

// Hook pour hasher le mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Méthode pour vérifier le mot de passe lors de la connexion
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
