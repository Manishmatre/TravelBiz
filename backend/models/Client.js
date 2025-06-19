const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passportNumber: { type: String, required: true, unique: true },
  nationality: { type: String, required: true },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Client', clientSchema); 