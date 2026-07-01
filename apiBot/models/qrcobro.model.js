const { DataTypes } = require('sequelize');
const adapterDB = require('../provider/database');

const QRcobros = adapterDB.define('qr_cobros',
    {
        id_qr_cobro: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // serial4
        },
        id_banco: {
            type: DataTypes.INTEGER, // int4
        },
        id_curso: {
            type: DataTypes.INTEGER, // int4
        },
        id_usuario: {
            type: DataTypes.INTEGER, // int4
        },
        codigo_qr: {
            type: DataTypes.STRING(100), // varchar(100)
        },
        url_imagen_qr: {
            type: DataTypes.STRING(255), // varchar(255)
        },
        monto_fijo: {
            type: DataTypes.DECIMAL(10, 2), // numeric(10, 2)
        },
        moneda: {
            type: DataTypes.STRING(10), // varchar(10)
        },
        descripcion: {
            type: DataTypes.STRING(200), // varchar(200)
        },
        fecha_expiracion: {
            // Como tu diagrama dice 'date' y no 'timestamptz', usamos DATEONLY 
            // para guardar solo "YYYY-MM-DD" sin la hora exacta.
            type: DataTypes.DATEONLY,
        },
        activo: {
            type: DataTypes.BOOLEAN, // bool
            defaultValue: true
        }
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        schema: 'cursos'
    });

module.exports = QRcobros