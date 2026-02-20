const { DataTypes } = require('sequelize');
const adapterDB = require('../provider/database');

const Persona = adapterDB.define('personas',
    {
        id_persona: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING
        },
        materno: {
            type: DataTypes.STRING
        },
        paterno: {
            type: DataTypes.STRING
        },
        correo: {
            type: DataTypes.STRING,
            unique: true
        },
        ci: {
            type: DataTypes.STRING,
            unique: true
        },
        celular: {
            type: DataTypes.STRING
        },
        img: {
            type: DataTypes.STRING
        },
        sexo: {
            type: DataTypes.STRING,
        },
        fecha_nacimiento: {
            type: DataTypes.STRING
        },
        notificaciones_chatbot: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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

module.exports = Persona