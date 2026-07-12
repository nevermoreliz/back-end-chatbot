const { DataTypes } = require('sequelize');
const adapterDB = require('../provider/database');
const Usuario = require('./usuario.model');
const Curso = require('./curso.model');

const CursoAgente = adapterDB.define('cursos_agentes',
    {
        id_curso_agente: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
        },
        id_curso: {
            type: DataTypes.INTEGER, // INT NOT NULL
        },
        rol_agente: {
            type: DataTypes.STRING(30), // VARCHAR(30)
            defaultValue: 'Responsable', // DEFAULT 'Responsable'
            validate: {
                // Esto simula tu restricción CHECK (rol_agente IN (...))
                isIn: [['Responsable', 'Apoyo', 'Supervisor']]
            }
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        fecha_asignacion: {
            type: DataTypes.STRING,
        }
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'cursos_agentes',
        schema: 'cursos'
    }
);


Usuario.belongsToMany(Curso, { through: CursoAgente, foreignKey: 'id_usuario' });
Curso.belongsToMany(Usuario, { through: CursoAgente, foreignKey: 'id_curso' });

module.exports = CursoAgente