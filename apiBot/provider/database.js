const { Sequelize } = require('sequelize');
require('dotenv').config();

const POSTGRES_DB_HOST = process.env.POSTGRES_DB_HOST || 'localhost';
const POSTGRES_DB_USER = process.env.POSTGRES_DB_USER || 'postgres';
const POSTGRES_DB_PASSWORD = process.env.POSTGRES_DB_PASSWORD;
const POSTGRES_DB_NAME = process.env.POSTGRES_DB_NAME;
const POSTGRES_DB_PORT = process.env.POSTGRES_DB_PORT || 5432;

const sequelize = new Sequelize(POSTGRES_DB_NAME, POSTGRES_DB_USER, POSTGRES_DB_PASSWORD, {
    host: POSTGRES_DB_HOST,
    port: POSTGRES_DB_PORT,
    dialect: 'postgres',
    logging: false
});

module.exports = sequelize;
