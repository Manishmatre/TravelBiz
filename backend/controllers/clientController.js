const Client = require('../models/Client');
const User = require('../models/User');
const Activity = require('../models/Activity');

// Create a new client
exports.createClient = async (req, res) => {
  try {
    const { name, email, passportNumber, nationality, assignedAgent } = req.body;
    const client = await Client.create({
      name,
      email,
      passportNumber,
      nationality,
      assignedAgent: assignedAgent || req.user._id,
      agencyId: req.user.agencyId,
    });
    // Log activity
    const activity = await Activity.create({
      actionType: 'create',
      entityType: 'Client',
      entityId: client._id,
      entityName: client.name,
      performedBy: req.user.id,
      performedByName: req.user.name,
      agencyId: req.user.agencyId,
      details: { email: client.email }
    });
    req.app.get('io').emit('activity', activity);
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all clients (admin sees all, agent sees only their clients)
exports.getClients = async (req, res) => {
  try {
    let filter = { agencyId: req.user.agencyId };
    if (req.user.role === 'agent') {
      filter.assignedAgent = req.user._id;
    }
    const clients = await Client.find(filter).populate('assignedAgent', 'name email role');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get client by ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, agencyId: req.user.agencyId }).populate('assignedAgent', 'name email role');
    if (!client) return res.status(404).json({ message: 'Client not found' });
    // Agent can only access their own clients
    if (req.user.role === 'agent' && String(client.assignedAgent._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update client
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    // Agent can only update their own clients
    if (req.user.role === 'agent' && String(client.assignedAgent) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(client, req.body);
    const updatedClient = await client.save();
    // Log activity
    const activity = await Activity.create({
      actionType: 'update',
      entityType: 'Client',
      entityId: updatedClient._id,
      entityName: updatedClient.name,
      performedBy: req.user.id,
      performedByName: req.user.name,
      agencyId: req.user.agencyId,
      details: req.body
    });
    req.app.get('io').emit('activity', activity);
    res.json(updatedClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    // Agent can only delete their own clients
    if (req.user.role === 'agent' && String(client.assignedAgent) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const deletedClient = await client.deleteOne();
    // Log activity
    const activity = await Activity.create({
      actionType: 'delete',
      entityType: 'Client',
      entityId: deletedClient._id,
      entityName: deletedClient.name,
      performedBy: req.user.id,
      performedByName: req.user.name,
      agencyId: req.user.agencyId,
      details: { email: deletedClient.email }
    });
    req.app.get('io').emit('activity', activity);
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 