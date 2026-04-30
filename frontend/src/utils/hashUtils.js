import { ethers } from 'ethers';

// IMPORTANT: This must produce the EXACT same string as the backend!
export function generateCertificateHash(certData) {
  const dataString = `${certData.studentName}|${certData.courseName}|${certData.issuedDate}|${certData.issuedBy}`;

  return crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(dataString)
  ).then(buffer => {
    // Convert buffer to hex string
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  });
}