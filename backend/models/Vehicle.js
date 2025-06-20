const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  type: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Upcoming', 'Completed', 'Overdue'], default: 'Upcoming' },
  cost: { type: Number },
  notes: { type: String }
}, { _id: true });

const fuelLogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  fuel: { type: Number, required: true },
  cost: { type: Number },
  mileage: { type: Number }
}, { _id: true });

const assignmentSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Assigned', 'Unassigned'], default: 'Assigned' }
}, { _id: true });

const documentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  fileUrl: { type: String, required: true },
  expiryDate: { type: Date },
  uploadedAt: { type: Date, default: Date.now },
  notes: { type: String }
}, { _id: true });

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vehicleType: { type: String, required: true }, // SUV, Bus, etc.
  numberPlate: { type: String, required: true, unique: true },
  insuranceExpiry: { type: Date, required: true },
  pucExpiry: { type: Date },
  assignedClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  assignedTrip: { type: String }, // Optional, can be expanded later
  driverName: { type: String },
  driverContact: { type: String },
  status: { type: String, enum: ['available', 'on-trip', 'maintenance'], default: 'available' },
  photoUrl: { type: String },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  createdAt: { type: Date, default: Date.now },
  maintenance: [maintenanceSchema],
  fuelLogs: [fuelLogSchema],
  assignments: [assignmentSchema],
  documents: [documentSchema],
});

vehicleSchema.index({ agencyId: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema); 