const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
  username: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'robertson12'
  },
    firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Robertson', // Default first name
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Samandram',
  },
});

module.exports = Admin;