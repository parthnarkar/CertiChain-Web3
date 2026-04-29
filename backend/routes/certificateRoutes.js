const express = require('express');
const router = express.Router();
const { createCertificate, getCertificateByHash } = require('../controllers/certificateController');

//POST /api/certificates/create
router.post('/create', createCertificate);

// GET /api/certificates/:hash
router.get('/:hash', getCertificateByHash);

module.exports = router;