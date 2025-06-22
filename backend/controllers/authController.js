const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Agency = require('../models/Agency');

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, agencyId: user.agencyId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, agencyName } = req.body;
    if (!agencyName) {
      return res.status(400).json({ message: 'Agency name is required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    
    // 1. Create the agency first
    const agency = await Agency.create({ name: agencyName });
    console.log('--- AGENCY CREATED ---');
    console.log(agency);

    // 2. Create the user, linking them to the agency
    const userPayload = {
      name,
      email,
      password,
      role: 'admin',
      agencyId: agency._id,
    };
    console.log('--- USER PAYLOAD BEFORE CREATE ---');
    console.log(userPayload);
    
    const user = await User.create(userPayload);

    // 3. Update the agency with the user as the owner
    agency.owner = user._id;
    await agency.save();

    const token = generateToken(user);
    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, agencyId: user.agencyId } });
  } catch (err) {
    console.error('SIGNUP ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, agencyId: user.agencyId } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 