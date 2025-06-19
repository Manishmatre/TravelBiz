const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, unique: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  speed: { type: Number, required: true },
  status: { type: String, enum: ['moving', 'stopped'], required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Location', locationSchema); 