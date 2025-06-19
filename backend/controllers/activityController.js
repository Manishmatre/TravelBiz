const Activity = require('../models/Activity');

// GET /api/files/activity?limit=20&skip=0&entityType=Client&actionType=create
exports.getActivities = async (req, res) => {
  try {
    const { limit = 20, skip = 0, entityType, actionType } = req.query;
    const filter = { agencyId: req.user.agencyId };
    if (entityType) filter.entityType = entityType;
    if (actionType) filter.actionType = actionType;
    const activities = await Activity.find(filter)
      .sort({ timestamp: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
}; 