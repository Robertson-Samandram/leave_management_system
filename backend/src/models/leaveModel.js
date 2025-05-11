const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Leave = sequelize.define('Leave', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  leaveType: {
    type: DataTypes.ENUM('Casual Leave', 'Earned Leave', 'Combined Leave'), // Match ENUM values
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
  },
  casualLeaveRequested: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  earnedLeaveRequested: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Leave;