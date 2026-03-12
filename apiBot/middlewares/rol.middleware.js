const { handleHttpError } = require('../utils/handle-error')

/**
 * Array con los Roles permitidos
 * @param {*} roles 
 * @returns 
 */

const checkRol = (roles) => (req, res, next) => {
    try {
        const { usuario } = req;
        // console.log("checkRol:", { usuario });

        const rolesByUser = usuario.roles;
        //TODO: ["administrador","agente","usuario registrado"]
        const checkValueRol = roles.some((rolSingle) => rolesByUser.includes(rolSingle)); //TODO: true, false
        if (!checkValueRol) {
            handleHttpError(res, "USUARIO_SIN_PERMISOS", 403);
            return;
        }
        next();
    } catch (e) {
        handleHttpError(res, "ERROR_PERMISOS", 403);
    }
};

module.exports = checkRol;