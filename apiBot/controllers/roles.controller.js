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

        // Obtener parámetros de paginación desde query params o body
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'id_rol';
        const sortOrder = req.query.sortOrder || 'desc';

        // ─── Condición de búsqueda
        const where = search ? {
            [Op.or]: [
                { nombre_rol: { [Op.like]: `%${search}%` } }
            ]
        } : {};

        try {

            const { count: totalItems, rows: roles } = await Rol.findAndCountAll({
                where,
                limit,
                offset,
                order: [[sortBy, sortOrder.toUpperCase()]]
            });

            // ─── Meta de paginación
            const paginacion = {
                total: totalItems,
                page,
                limit,
                totalPages: Math.ceil(totalItems / limit)
            };

            if (!roles) {
                return handleHttpError(res, 404, "ROLES_NO_ENCONTRADOS")
            }

            handleResponseJson(res, 200, roles, 'LISTA_ROLES', paginacion);

        } catch (dbError) {
            console.log("Error al obtener lista roles:", dbError.message);
            handleHttpError(res, "ERROR_LISTAR_ROLES", 500);
        }

    } catch (error) {
        console.log('[ERROR]: ', error);
        handleHttpError(res, 'ERROR_GET_ROLES')
    }
};

const createRol = async (req, res) => {
    try {

        const { nombre_rol, descripcion } = matchedData(req);



        const existRol = await Rol.findOne({
            where: { nombre_rol }
        });


        if (existRol) {
            return handleHttpError(res, 404, "ROL_YA_EXISTE")
        }

        try {

            const rolCreated = await Rol.create({ nombre_rol, descripcion });

            console.log('rol created: ', rolCreated);

        } catch (error) {
            console.log('Error al crear rol:', error);
            handleHttpError(res, "ERROR_CREAR_ROL", 500);
        }




        handleResponseJson(res, 200, rolCreated, 'ROL_CREADO');

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