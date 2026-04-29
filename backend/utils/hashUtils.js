const crypto = require('crypto');

function generateCertificateHash(certData) {
  //creating a whole combined string
  const dataString = `${certData.studentName}|${certData.courseName}|${certData.issuedDate}|${certData.issuedBy}`;

  // Generating a Hash Value for this String
  const hash = crypto
    .createHash('sha256')
    .update(dataString)
    .digest('hex');

  return hash;
}

module.exports = { generateCertificateHash };