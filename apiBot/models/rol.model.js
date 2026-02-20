const { DataTypes } = require('sequelize');
const adapterDB = require('../provider/database');

const Rol = adapterDB.define('roles',
    {
        id_rol: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre_rol: {
            type: DataTypes.STRING
        },
        descripcion: {
            type: DataTypes.TEXT
        }
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        schema: 'cursos'
    });

module.exports = Rol