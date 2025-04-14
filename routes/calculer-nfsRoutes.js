// routes/calculer-nfsRoutes.js
const express = require('express')
const router = express.Router()
const { calculerNFS } = require('../controllers/calculer-nfsController')

// POST /api/calculer-nfs
router.post('/', calculerNFS)

module.exports = router
