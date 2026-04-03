const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handle-error');
const { handleResponseJson } = require('../utils/handle-response-json')
const RolUsuarioRol = require('../models/usuarios-roles.model');



const asignarRol = async (req, res) => {
    try {

        const { id_usuario, id_rol } = matchedData(req);

        const rolAsignado = await RolUsuarioRol.create({ id_usuario, id_rol });

        // if (!rol) {
        //     return handleHttpError(res, 404, "ROL_NO_ENCONTRADO")
        // }


        handleResponseJson(res, 200, rolAsignado, "ROL_ASIGNADO");

    } catch (error) {
        // console.error("Error en asignarRol:", error);
        handleHttpError(res, 'ERROR_ASIGNAR_ROL')
    }
};

const actualizarRol = async (req, res) => {
    try {

        const { id_usuario, id_rol } = matchedData(req);

        const rolActualizado = await RolUsuarioRol.update({ id_usuario, id_rol }, { where: { id_usuario, id_rol } });

        // if (!rol) {
        //     return handleHttpError(res, 404, "ROL_NO_ENCONTRADO")
        // }


        handleResponseJson(res, 200, rolActualizado, "ROL_ACTUALIZADO");

    } catch (error) {
        // console.error("Error en asignarRol:", error);
        handleHttpError(res, 'ERROR_ACTUALIZAR_ROL')
    }
};

module.exports = { asignarRol, actualizarRol }