const { DataTypes } = require('sequelize');
const adapterDB = require('../provider/database');

const CursoAgente = adapterDB.define('cursos_agentes',
    {
        id_curso_agente: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // serial4
        },
        id_usuario: {
            type: DataTypes.INTEGER, // int4
        },
        id_curso: {
            type: DataTypes.INTEGER, // int4
        },
        rol_agente: {
            type: DataTypes.STRING(30), // varchar(30)
            // En tu diagrama no tiene la etiqueta NOT NULL, por lo que permitimos nulos.
            // Sin embargo, en la práctica suele ser buena idea hacerlo obligatorio (allowNull: false)
        },
        activo: {
            type: DataTypes.BOOLEAN, // bool
            defaultValue: true // Asumimos que al asignarlo está activo por defecto
        },
        fecha_asignacion: {
            type: DataTypes.DATE, // timestamptz
        }
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        schema: 'cursos'
    });

module.exports = CursoAgente