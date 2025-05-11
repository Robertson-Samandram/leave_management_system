const Leave = require('../models/leaveModel');

// Get all leave requests
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.findAll();
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get leave requests by username
exports.getLeavesByUsername = async (req, res) => {
  try {
    const { username } = req.query;
    const leaves = await Leave.findAll({ where: { username } });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new leave request
exports.createLeave = async (req, res) => {
  try {
    console.log('Incoming Leave Request:', req.body); // Log the request body for debugging

    const {
      username,
      type,
      startDate,
      endDate,
      reason,
      status,
      casualLeaveRequested,
      earnedLeaveRequested,
    } = req.body;

    // Validate required fields
    if (!username || !type || !startDate || !endDate || !status) {
      console.error('Error: Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create the leave request
    const leave = await Leave.create({
      username,
      leaveType: type, // Ensure this matches the ENUM value
      startDate,
      endDate,
      reason,
      status,
      casualLeaveRequested: casualLeaveRequested || 0,
      earnedLeaveRequested: earnedLeaveRequested || 0,
    });

    res.status(201).json(leave);
  } catch (error) {
    console.error('Error creating leave:', error); // Log the error for debugging
    res.status(500).json({ error: error.message });
  }
};

// Update leave status (approve/reject)
exports.updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findByPk(id);
    if (!leave) return res.status(404).json({ error: 'Leave not found' });

    await leave.update(req.body);
    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a leave request (withdraw)
exports.deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findByPk(id);
    if (!leave) return res.status(404).json({ error: 'Leave not found' });

    await leave.destroy();
    res.status(200).json({ message: 'Leave deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.withdrawLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;

    // Find the leave by ID
    const leave = await Leave.findByPk(leaveId); // Sequelize method to find by primary key
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    // Update the leave status to "Withdrawn"
    leave.status = 'Withdrawn';
    await leave.save(); // Save the updated leave

    res.status(200).json(leave);
  } catch (error) {
    console.error('Error withdrawing leave:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};