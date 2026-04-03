const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handle-error');
const { handleResponseJson, handleResponseJsonMsg } = require('../utils/handle-response-json')
const { encrypt } = require('../utils/handle-password');
const { Op } = require('sequelize');
const { tokenSing } = require('../utils/handle-jwt');
const Rol = require('../models/rol.model');


const getRol = async (req, res) => {
    try {

        const { id } = req.params;

        const rol = await Rol.findByPk(id);

        if (!rol) {
            return handleHttpError(res, 404, "ROL_NO_ENCONTRADO")
        }

        handleResponseJson(res, 200, rol);

    } catch (error) {
        handleHttpError(res, 'ERROR_GET_ROL_DETALLE')
    }
};

const getRoles = async (req, res) => {
    try {

        const roles = await Rol.findAll();

        if (!roles) {
            return handleHttpError(res, 404, "ROLES_NO_ENCONTRADOS")
        }

        handleResponseJson(res, 200, roles);

    } catch (error) {
        handleHttpError(res, 'ERROR_GET_ROLES')
    }
};

const createRol = async (req, res) => {
    try {

        const validatedData = matchedData(req);
        const { nombre_rol } = validatedData;

        /* ------------- consultar si existe el mismo nombre de usuario ------------- */
        const rol = await Rol.findOne({
            where: {
                [Op.or]:
                    [
                        { nombre_rol }
                    ]
            }
        });

        /* -------------------- verificar si el usuairo ya existe ------------------- */
        if (rol) {
            return handleResponseJsonMsg(res, 200, "NOMBRE_DE_ROL_YA_EXISTE")
        }

        /* ------------------------------ crear rol ----------------------------- */
        const dataRolCreate = { ...validatedData }

        /* ------------------- guardar el rol a base de datos ------------------- */
        const rolData = await Rol.create(dataRolCreate);

        const data = {
            rol: rolData
        }

        /* ------------------------ enviar respuesta en json ------------------------ */
        handleResponseJson(res, 200, data);

    } catch (error) {
        handleHttpError(res, 'ERROR_CREATE_ROL')
        // console.log(error);
    }
};

const updateRol = async (req, res) => {

    /* ------------------------------ validar token ----------------------------- */
    try {
        const id_rol = req.params.id
        req = matchedData(req)

        const rolDb = await Rol.findByPk(id_rol);

        if (!rolDb) {
            return handleResponseJsonMsg(res, 404, 'NO_EXISTE_ESE_ROL_CON_ESE_ID')
        }

        const campos = req;

        /* ------------- actualiza rol solo en mombre de rol ------------- */
        const rolActualizado = await Rol.update(campos, { where: { id_rol } })

        handleResponseJson(res, 200, rolActualizado, 'ROL_ACTUALIZADO');

    } catch (error) {
        // console.log(error);
        handleHttpError(res, 'ERROR_UPDATE_ROL')
    }
};

const deleteRol = async (req, res) => {
    try {

        // obtener el parametro id de la url
        const { id } = req.params;


        await Rol.update({ activo: false }, { where: { id_rol: id } })

        handleResponseJsonMsg(res, 200, 'ROL_ELIMINADO');


    } catch (error) {
        handleHttpError(res, 'ERROR_DELETE_ROL')
        console.log("ERROR_DELETE_ROL", error);

    }
};

module.exports = { getRol, getRoles, createRol, updateRol, deleteRol }