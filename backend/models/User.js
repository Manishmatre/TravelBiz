const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'agent', 'driver', 'client'], default: 'agent' },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
  createdAt: { type: Date, default: Date.now },
  // Profile fields
  avatarUrl: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  department: { type: String, default: '' },
  employeeId: { type: String, default: '' },
  joiningDate: { type: String, default: '' },
  skills: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  resume: { type: String, default: '' },
  // Bank fields (deprecated, use bankAccounts)
  bankHolder: { type: String, default: '' },
  bankName: { type: String, default: '' },
  account: { type: String, default: '' },
  ifsc: { type: String, default: '' },
  upi: { type: String, default: '' },
  pan: { type: String, default: '' },
  salary: { type: String, default: '' },
  // Multiple bank accounts
  bankAccounts: [{
    bankHolder: { type: String, default: '' },
    bankName: { type: String, default: '' },
    account: { type: String, default: '' },
    ifsc: { type: String, default: '' },
    upi: { type: String, default: '' },
    pan: { type: String, default: '' },
    salary: { type: String, default: '' }
  }],
  // Multiple payment methods
  paymentMethods: [{
    type: { type: String, default: '' },
    details: { type: String, default: '' }
  }],
  // Account/security fields
  twofa: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  // Settings
  notifications: { type: Boolean, default: true },
  language: { type: String, default: 'en' },
  theme: { type: String, default: 'light' },
  privacy: { type: Boolean, default: false },
  // Address fields
  phone: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  gender: { type: String, default: '' },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    postalCode: { type: String, default: '' }
  },
  // Driver-specific fields
  licenseNumber: { type: String, default: '' },
  licenseExpiry: { type: String, default: '' },
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  documents: [{
    type: { type: String, default: '' }, // e.g., 'license', 'ID', etc.
    url: { type: String, default: '' },
    expiryDate: { type: String, default: '' }
  }],
  status: { type: String, default: 'Active' },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 