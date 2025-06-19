const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileType: { type: String, required: true }, // e.g., Visa, Passport, Ticket
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadDate: { type: Date, default: Date.now },
  fileUrl: { type: String, required: true },
  originalName: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
});

fileSchema.index({ agencyId: 1 });

module.exports = mongoose.model('File', fileSchema); 