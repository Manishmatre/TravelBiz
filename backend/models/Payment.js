const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentDate: { type: Date, default: Date.now, required: true },
  paymentMethod: { type: String, enum: ['Credit Card', 'Bank Transfer', 'Cash', 'Other'], default: 'Credit Card' },
  status: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  transactionId: { type: String },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

paymentSchema.index({ agencyId: 1, clientId: 1 });

module.exports = mongoose.model('Payment', paymentSchema); 