const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  casualLeaves: {
    type: DataTypes.INTEGER,
    defaultValue: 12,
  },
  earnedLeaves: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
  },
  combinedLeaves: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.casualLeaves + this.earnedLeaves;
    },
  },
});

module.exports = User;