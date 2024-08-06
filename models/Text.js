// models/Text.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Text = sequelize.define('Text', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  hash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  sessionType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Text;
