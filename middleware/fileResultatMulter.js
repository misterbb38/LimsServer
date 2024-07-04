// middleware/fileResultatMulter.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Création du dossier s'il n'existe pas
const uploadDir = path.join(__dirname, '..', 'resultatExterne');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Le fichier doit être au format PDF'), false);
    }
};

const fileResultatMulter = multer({ storage: storage, fileFilter: fileFilter });

module.exports = fileResultatMulter;
