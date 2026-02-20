const { DataTypes } = require('sequelize');
const adapterDB = require('../provider/database');

const Usuario = adapterDB.define('usuarios',
    {
        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_persona: {
            type: DataTypes.INTEGER
        },
        nombre_usuario: {
            type: DataTypes.STRING
        },
        contrasenia_hash: {
            type: DataTypes.STRING
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        }
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        schema: 'cursos'
    });

module.exports = Usuario