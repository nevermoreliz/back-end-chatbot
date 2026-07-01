const { DataTypes } = require('sequelize');
const adapterDB = require('../provider/database');

const Categoriacurso = adapterDB.define('categorias_cursos',
    {
        id_categoria: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // Esto equivale al 'serial4'
        },
        nombre_categoria: {
            type: DataTypes.STRING(100), // varchar(100)
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true // En tu diagrama no dice NOT NULL, así que permitimos nulos
        },
        icono: {
            type: DataTypes.STRING(100), // varchar(100)
            allowNull: true
        },
        color_hex: {
            type: DataTypes.STRING(7), // varchar(7) ideal para códigos como #FFFFFF
            allowNull: true
        },
        activo: {
            type: DataTypes.BOOLEAN, // bool
            allowNull: true,
            defaultValue: true // Es buena práctica que por defecto esté activa
        }
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        schema: 'cursos'
    });

module.exports = Categoriacurso