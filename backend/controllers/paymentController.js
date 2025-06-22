const Payment = require('../models/Payment');
const Client = require('../models/Client');
const Activity = require('../models/Activity');

// Get all payments for a client
exports.getPaymentsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const payments = await Payment.find({ clientId, agencyId: req.user.agencyId })
      .populate('bookingId', 'destination')
      .populate('createdBy', 'name')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new payment for a client
exports.createPayment = async (req, res) => {
  try {
    const { clientId } = req.params;
    const paymentData = { 
      ...req.body, 
      clientId,
      agencyId: req.user.agencyId,
      createdBy: req.user._id
    };
    
    const payment = await Payment.create(paymentData);

    // Log activity
    const activity = await Activity.create({
      actionType: 'create',
      entityType: 'Payment',
      entityId: payment._id,
      entityName: `Payment of ${payment.amount} for client`,
      performedBy: req.user.id,
      performedByName: req.user.name,
      agencyId: req.user.agencyId,
      details: { amount: payment.amount, status: payment.status, clientId }
    });
    req.app.get('io').emit('activity', activity);

    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a payment
exports.updatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: paymentId, agencyId: req.user.agencyId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(updatedPayment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a payment
exports.deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const deletedPayment = await Payment.findOneAndDelete({ _id: paymentId, agencyId: req.user.agencyId });

    if (!deletedPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 