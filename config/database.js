// config/database.js
const { Sequelize } = require('sequelize');
const config = require('./config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
});

console.log(sequelize instanceof Sequelize); // Should log 'true'
console.log(typeof sequelize.define); // Should log 'function'

module.exports = sequelize;
