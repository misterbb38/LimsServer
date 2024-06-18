const Test = require('../models/testModel');
// Middleware asyncHandler pour gérer les fonctions asynchrones et les erreurs
const asyncHandler = require('../middleware/async');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const readExcelFile = require('read-excel-file/node');




/**
 * @desc    Obtenir tous les tests
 * @route   GET /api/tests
 * @access  Public
 */

exports.getTests = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 25;
    const skip = (page - 1) * limit;
    const { search } = req.query;  // Récupération du paramètre de recherche depuis la requête

    // Construction du filtre de recherche
    let query = {};
    if (search) {
        query.nom = { $regex: new RegExp(search, 'i') };  // Recherche insensible à la casse sur le champ 'nom'
    }

    // Récupération des tests avec pagination et filtre de recherche
    const tests = await Test.find(query).skip(skip).limit(limit);

    // Récupération du nombre total de tests correspondant au filtre pour le calcul des pages
    const count = await Test.countDocuments(query);

    // Réponse avec la liste des tests paginée et filtrée
    res.status(200).json({
        success: true,
        count: tests.length,
        total: count,
        totalPages: Math.ceil(count / limit),
        data: tests,
        message: 'success'
    });
});

exports.getTestsAnalyse = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 500;
    const skip = (page - 1) * limit;
    const { search } = req.query;  // Récupération du paramètre de recherche depuis la requête

    // Construction du filtre de recherche
    let query = {};
    if (search) {
        query.nom = { $regex: new RegExp(search, 'i') };  // Recherche insensible à la casse sur le champ 'nom'
    }

    // Récupération des tests avec pagination et filtre de recherche
    const tests = await Test.find(query).skip(skip).limit(limit);

    // Récupération du nombre total de tests correspondant au filtre pour le calcul des pages
    const count = await Test.countDocuments(query);

    // Réponse avec la liste des tests paginée et filtrée
    res.status(200).json({
        success: true,
        count: tests.length,
        total: count,
        totalPages: Math.ceil(count / limit),
        data: tests,
        message: 'success'
    });
});


/**
 * @desc    Obtenir un test par son ID
 * @route   GET /api/tests/:id
 * @access  Public
 */
exports.getTest = asyncHandler(async (req, res) => {
    // Recherche du test par son ID
    const test = await Test.findById(req.params.id);

    // Si aucun test trouvé, renvoyer une erreur 404
    if (!test) {
        res.status(404);
        throw new Error(`Test non trouvé avec l'ID ${req.params.id}`);
    }

    // Réponse avec le test trouvé
    res.status(200).json({ success: true, data: test, message: 'Test Success' });
});



exports.createTest = asyncHandler(async (req, res) => {
    const {
        nom,
        description,
        prixAssurance,
        prixIpm,
        prixPaf,
        prixSococim,
        prixClinique,
        coeficiantB,
        status,
        categories,
        valeurMachineA,
        valeurMachineB,
        machineA,
        machineB,
        interpretationA,
        interpretationB,
        conclusions
    } = req.body;

    // Création d'une nouvelle instance du modèle Test
    const test = new Test({
        nom,
        description,
        prixAssurance,
        prixIpm,
        prixPaf,
        prixSococim,
        prixClinique,
        coeficiantB,
        status,
        categories,   // Ajout du champ categories
        valeurMachineA,
        valeurMachineB,
        machineA,
        machineB,      // Ajout du champ valeur
        interpretationA,
        interpretationB, // Ajout du champ interpretation
        conclusions
    });

    // Sauvegarde du nouveau test dans la base de données
    const createdTest = await test.save();

    // Réponse avec le test créé
    res.status(201).json({
        success: true,
        data: createdTest,
        message: 'Test créé avec succès'
    });
});


/**
 * @desc    Supprimer un test par son ID
 * @route   DELETE /api/tests/:id
 * @access  Private/Admin
 */
exports.deleteTest = asyncHandler(async (req, res) => {
    // Recherche et suppression du test par son ID
    const test = await Test.findByIdAndDelete(req.params.id);

    // Si aucun test trouvé, renvoyer une erreur 404
    if (!test) {
        res.status(404);
        throw new Error(`Test non trouvé avec l'ID ${req.params.id}`);
    }

    // Réponse confirmant la suppression
    res.status(200).json({ success: true, data: {}, message: 'test supprimer' });
});

/**
 * @desc    Mettre à jour un test par son ID
 * @route   PUT /api/tests/:id
 * @access  Private/Admin
 */
exports.updateTest = asyncHandler(async (req, res) => {
    // Recherche et mise à jour du test, avec retour du document mis à jour
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // Si aucun test trouvé, renvoyer une erreur 404
    if (!test) {
        res.status(404);
        throw new Error(`Test non trouvé avec l'ID ${req.params.id}`);
    }

    // Réponse avec le test mis à jour
    res.status(200).json({ success: true, data: test, message: 'mise a jour reussus' });
});




exports.importTestsFromExcel = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).send("Aucun fichier n'a été téléchargé.");
    }

    // Chemin du fichier Excel téléchargé
    const filePath = req.file.path;

    // Lire le fichier Excel
    readExcelFile(filePath).then(async (rows) => {
        // Supposons que la première ligne contient les en-têtes et que les données commencent à la deuxième ligne
        const tests = rows.slice(1).map(row => ({
            nom: row[0], // La première colonne contient le nom
            coeficiantB: row[1], // La deuxième colonne contient le coefficient B
            categories: row[2], // La troisième colonne contient les catégories
            valeur: row[3], // La quatrième colonne contient la valeur
            interpretation: row[4], // La cinquième colonne contient l'interprétation
            description: "Description par défaut", // Description par défaut si non spécifiée
            prixAssurance: 260, // Valeur par défaut
            prixIpm: 220, // Valeur par défaut
            prixPaf: 200, // Valeur par défaut
            status: true // Activé par défaut
        }));

        // Insérer les tests dans la base de données
        await Test.insertMany(tests);

        // Réponse avec le résultat
        res.status(200).json({
            success: true,
            message: "Les tests ont été importés avec succès",
            data: tests.length // Retourner le nombre de tests importés
        });
    }).catch(error => {
        res.status(500).json({ success: false, message: "Erreur lors de la lecture du fichier Excel", error: error.toString() });
    });
});


