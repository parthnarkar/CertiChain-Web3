const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  courseName: { type: String, required: true },
  issuedDate: { type: String, required: true },
  issuedBy: { type: String, required: true },
  hash: { type: String, required: true, unique: true }, // the fingerprint
  txHash: { type: String },   // blockchain transaction ID
}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);
module.exports = Certificate;