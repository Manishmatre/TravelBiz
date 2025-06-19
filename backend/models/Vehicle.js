const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vehicleType: { type: String, required: true }, // SUV, Bus, etc.
  numberPlate: { type: String, required: true, unique: true },
  insuranceExpiry: { type: Date, required: true },
  assignedClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  assignedTrip: { type: String }, // Optional, can be expanded later
  driverName: { type: String },
  driverContact: { type: String },
  status: { type: String, enum: ['available', 'on-trip', 'maintenance'], default: 'available' },
  photoUrl: { type: String },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  createdAt: { type: Date, default: Date.now },
});

vehicleSchema.index({ agencyId: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema); 