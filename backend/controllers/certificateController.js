const Certificate = require('../models/Certificate');
const { generateCertificateHash } = require('../utils/hashUtils');

// POST /api/certificates/create
async function createCertificate(req, res) {
  try {
    const { studentName, courseName, issuedDate, issuedBy } = req.body;

    // Generate hash from certificate data
    const hash = generateCertificateHash({ studentName, courseName, issuedDate, issuedBy });

    // Save to MongoDB
    const certificate = await Certificate.create({
      studentName, courseName, issuedDate, issuedBy, hash
    });

    // Return hash to frontend — frontend will store it on blockchain
    res.status(201).json({
      message: 'Certificate created successfully',
      certificate,
      hash
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Certificate with this data already exists.' });
    }
    res.status(500).json({ message: 'Error creating certificate', error: error.message });
  }
}

async function getCertificateByHash(req, res) {
  try {
    const certificate = await Certificate.findOne({ hash: req.params.hash });
    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching certificate', error: error.message });
  }
}

module.exports = { createCertificate, getCertificateByHash };