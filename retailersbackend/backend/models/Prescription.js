const mongoose = require('mongoose');
const { JSONModel } = require('./dbMock');

if (process.env.USE_MOCK_DB === 'true') {
  class Prescription extends JSONModel {}
  Prescription.collectionName = 'prescriptions';
  module.exports = Prescription;
  return;
}

const prescriptionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  patient: String,
  doc: String,
  status: String,
  date: String
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
