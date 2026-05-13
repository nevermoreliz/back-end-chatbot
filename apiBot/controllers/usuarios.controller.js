const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handle-error');
const { handleResponseJson, handleResponseJsonMsg } = require('../utils/handle-response-json')
const Usuario = require('../models/usuario.model');
const { encrypt } = require('../utils/handle-password');
const { Op } = require('sequelize');
const { tokenSing } = require('../utils/handle-jwt');


const getUsuario = async (req, res) => {
    try {

        const { id } = req.params;

        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return handleHttpError(res, 404, "USUARIO_NO_ENCONTRADO")
        }

        handleResponseJson(res, 200, usuario);

    } catch (error) {
        handleHttpError(res, 'ERROR_GET_USUARIO_DETALLE')
    }
};

const getUsuarios = async (req, res) => {
    try {

        const usuarios = await Usuario.findAll();
        if (!usuarios) {
            return handleHttpError(res, 404, "USUARIOS_NO_ENCONTRADOS")
        }

        handleResponseJson(res, 200, usuarios);

    } catch (error) {
        handleHttpError(res, 'ERROR_GET_USUARIOS')
    }
};

const createUsuario = async (req, res) => {
    try {

        const validatedData = matchedData(req);
        const { id_persona, nombre_usuario, contrasenia_hash } = validatedData;

        /* ------------- consultar si existe el mismo nombre de usuario ------------- */
        const usuario = await Usuario.findOne({
            where: {
                [Op.or]:
                    [
                        { id_persona },
                        { nombre_usuario }
                    ]
            }
        });

        /* -------------------- verificar si el usuairo ya existe ------------------- */
        if (usuario) {
            return handleResponseJsonMsg(res, 200, "NOMBRE_DE_USUARIO_YA_EXISTE")
        }

        /* ------------------------------ crear usuario ----------------------------- */
        const contraseniaEncrypt = await encrypt(contrasenia_hash);
        const dataUsuarioCreate = { ...validatedData, contrasenia_hash: contraseniaEncrypt }

        /* ------------------- guardar el usuario a base de datos ------------------- */
        const usuarioData = await Usuario.create(dataUsuarioCreate);
        usuarioData.set('contrasenia_hash', undefined, { strict: false })

        /* ------------------------ enviar respuesta en json ------------------------ */
        handleResponseJson(res, 200, usuarioData);

    } catch (error) {
        handleHttpError(res, 'ERROR_CREATE_USUARIO')
        // console.log(error);
    }
};

const updateUsuario = async (req, res) => {

    /* ------------------------------ validar token ----------------------------- */
    try {
        const id_usuario = req.params.id
        req = matchedData(req)

        const usuarioDb = await Usuario.findByPk(id_usuario);

        if (!usuarioDb) {
            return handleResponseJsonMsg(res, 404, 'NO_EXISTE_ESE_USUARIO_CON_ESE_ID')
        }

        const campos = req;
        delete campos.contrasenia;

        /* ------------- actualiza usuario solo en mombre de usuario ------------- */
        const usuarioActualizado = await Usuario.update(campos, { where: { id_usuario } })

        handleResponseJson(res, 200, usuarioActualizado, 'USUARIO_ACTUALIZADO');

    } catch (error) {
        // console.log(error);
        handleHttpError(res, 'ERROR_UPDATE_USUARIO')
    }
};

// desabilita logicamente
const deleteUsuario = async (req, res) => {
    try {

        // obtener el parametro id de la url
        const { id } = req.params;

        const usuarioDb = await Usuario.findByPk(id);

        if (!usuarioDb) {
            return handleResponseJsonMsg(res, 404, 'NO_EXISTE_ESE_USUARIO_CON_ESE_ID')
        }

        await Usuario.update({ activo: false }, { where: { id_usuario: id } })

        handleResponseJsonMsg(res, 200, 'USUARIO_ELIMINADO');

    } catch (error) {
        handleHttpError(res, 'ERROR_DELETE_USUARIO')
        console.log("ERROR_DELETE_USUARIO", error);

    }
};

// habilita logicamente
const habilitarUsuario = async (req, res) => {
    try {

        // obtener el parametro id de la url
        const { id } = req.params;

        const usuarioDb = await Usuario.findByPk(id);

        if (!usuarioDb) {
            return handleResponseJsonMsg(res, 404, 'NO_EXISTE_ESE_USUARIO_CON_ESE_ID')
        }

        await Usuario.update({ activo: true }, { where: { id_usuario: id } })

        handleResponseJsonMsg(res, 200, 'USUARIO_HABILITADO');

    } catch (error) {
        handleHttpError(res, 'ERROR_HABILITAR_USUARIO')
        console.log("ERROR_HABILITAR_USUARIO", error);

    }
};

module.exports = { getUsuario, getUsuarios, createUsuario, updateUsuario, deleteUsuario, habilitarUsuario }