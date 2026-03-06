const { encrypt, compare } = require('../utils/handle-password');
const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handle-error');
const { tokenSing } = require('../utils/handle-jwt');
const { handleResponseJson } = require('../utils/handle-response-json');

const Usuario = require('../models/usuario.model');
const UsuarioRol = require('../models/usuarios-roles.model');


/**
 * este controlador es encargado de registrar
 * @param {*} req
 * @param {*} res
 */
const registroCtrl = async (req, res) => {
    try {
        req = matchedData(req)

        const contrasenia = await encrypt(req.contrasenia)
        const body = { ...req, contrasenia }

        const usu = await Usuario.create(body)
        usu.set('contrasenia', undefined, { strict: false })

        const data = {
            token: await tokenSing(usu),
            user: usu
        }

        // console.log(data);
        res.send(data)

    } catch (error) {
        console.log(error);
        handleHttpError(res, 'ERROR_REGISTER_USUARIO')
    }
};

/**
 * es el encargado de logear a una persona
 * @param {*} req
 * @param {*} res
 */
const loginCtrl = async (req, res) => {

    try {
        const { nombre_usuario, contrasenia_hash } = matchedData(req)

        /* --------------------- consultar si existe el usuario --------------------- */
        const usuarioDb = await Usuario.findOne({ where: { nombre_usuario } })

        /* -------- verifiar si el nombre de usuario existe en base de datos -------- */
        if (!usuarioDb) {
            return handleHttpError(res, 'USUARIO_NO_EXISTE', 404);
        }

        const consultaRoles = await UsuarioRol.findAll({
            where: { id_usuario: usuarioDb.id_usuario },
            attributes: ['id_rol']
        });
        // Extraer solo los valores de id_rol en un array simple
        const roles = consultaRoles.map(rol => rol.id_rol);
        // console.log('[Resultado]', roles);

        /* ------------------------- verificar la contraseña ------------------------ */
        const hashPassword = usuarioDb.contrasenia_hash;

        const check = await compare(contrasenia_hash, hashPassword)

        if (!check) {
            handleHttpError(res, 'CONTRASENIA_INVALIDA', 401)
            return
        }

        usuarioDb.contrasenia_hash = undefined;
        // usuarioRoles = { ...usuarioDb, roles }
        // usuarioRoles = { usuarioDb, roles }

        // Transforma los datos
        const usuarioRoles = {
            ...usuarioDb.toJSON(), // Convierte el modelo Sequelize a un objeto plano
            roles // Agrega el array de roles
        };

        const data = {
            token: await tokenSing(usuarioDb.id_usuario),
            user: usuarioRoles
        }

        // res.send({ data })
        handleResponseJson(res, 200, data);

    } catch (error) {
        console.log(error);
        handleHttpError(res, 'ERROR_LOGIN_USUARIO')
    }
}

const renewToken = async (req, res = response) => {

    try {
        // req.usuario -> viene de sessionStorage.middleware
        const usuario = req.usuario;

        // para que no muestra la contrasenia en el resultado
        usuario.contrasenia_hash = undefined;

        // Generar el TOKEN - JWT
        const data = {
            token: await tokenSing(usuario.id_usuario),
            user: usuario
        };

        handleResponseJson(res, 200, data, "TOKEN_RENOVADO");

    } catch (error) {
        console.log("error renew token: ", error);
        handleHttpError(res, "ERROR_RENEW_TOKEN");
    }

}

module.exports = { registroCtrl, loginCtrl, renewToken }