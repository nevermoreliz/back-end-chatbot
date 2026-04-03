const { DataTypes } = require('sequelize');
const adapterDB = require('../provider/database');
const Usuario = require('./usuario.model');
const Rol = require('./rol.model');

const UsuarioRol = adapterDB.define('usuarios_roles',
    {
        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        id_rol: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        fecha_asignacion: {
            type: DataTypes.STRING
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'usuarios_roles',
        schema: 'cursos'
    }
);


Usuario.belongsToMany(Rol, { through: UsuarioRol, foreignKey: 'id_usuario' });
Rol.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: 'id_rol' });

module.exports = UsuarioRol