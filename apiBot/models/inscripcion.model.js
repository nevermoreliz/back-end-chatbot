const { DataTypes } = require('sequelize');
const adapterDB = require('../provider/database');

const Inscripicion = adapterDB.define('inscripciones',
    {
        id_inscripcion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // serial4
        },
        id_persona: {
            type: DataTypes.INTEGER, // int4
            // references: { model: 'Personas', key: 'id_persona' } // Descomentar al configurar relaciones
        },
        id_curso: {
            type: DataTypes.INTEGER, // int4
            // references: { model: 'Cursos', key: 'id_curso' }
        },
        estado: {
            type: DataTypes.STRING(20), // varchar(20)
        },
        metodo_inscripcion: {
            type: DataTypes.STRING(20), // varchar(20)
        },
        metodo_pago_elegido: {
            type: DataTypes.STRING(20), // varchar(20)
        },
        id_cuenta_bancaria: {
            type: DataTypes.INTEGER, // int4
        },
        id_qr_cobro: {
            type: DataTypes.INTEGER, // int4
        },
        observaciones: {
            type: DataTypes.TEXT
        },
        fecha_inscripcion: {
            type: DataTypes.DATE, // timestamptz
        },
        fecha_confirmacion: {
            type: DataTypes.DATE, // timestamptz
        },
        fecha_cancelacion: {
            type: DataTypes.DATE, // timestamptz
        },
        motivo_cancelacion: {
            type: DataTypes.TEXT, // text
        },
        certificado_fisico_recogido: {
            type: DataTypes.BOOLEAN, // bool
        },
        fecha_recojo_certificado_fisico: {
            type: DataTypes.DATE, // timestamptz
        }
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        schema: 'cursos'
    });

module.exports = Inscripicion