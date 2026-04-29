const Certificate = require('../models/Certificate');
const { generateCertificateHash } = require('../utils/hashUtils');

// POST /api/certificates/create
// Admin calls this to create a new certificate
async function createCertificate(req, res) {
  try {
    const { studentName, courseName, issuedDate, issuedBy } = req.body;

    const hash = generateCertificateHash({ studentName, courseName, issuedDate, issuedBy });

    const certificate = await Certificate.create({
      studentName, courseName, issuedDate, issuedBy, hash
    });

    res.status(201).json({
      message: 'Certificate created successfully',
      certificate,
      hash
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating certificates', error: error.message });
  }
}

// GET /api/certificates/:hash
// Anyone can look up a certificate by its hash
async function getCertificateByHash(req, res) {
  try {
    const certificate = await Certificate.findOne({ hash: req.params.hash });
    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });

    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching certificates', error: error.message });
  }
}

module.exports = { createCertificate, getCertificateByHash };