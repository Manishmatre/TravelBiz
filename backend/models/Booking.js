const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  type: { type: String, enum: ['full', 'partial'], default: 'full' },
  mode: { type: String, enum: ['cash', 'card', 'online'], required: true },
  amountPaid: { type: Number, required: true },
  percent: { type: Number },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickup: { name: { type: String, required: true } },
  destination: { name: { type: String, required: true } },
  pickupCoordinates: { lat: { type: Number }, lng: { type: Number } },
  destinationCoordinates: { lat: { type: Number }, lng: { type: Number } },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  bags: { type: Number },
  payment: paymentSchema,
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
  price: { type: Number },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema); 