const { adapterDB } = require('../provider/database')
const Usuario = require('../models/usuario.model')
const { handleHttpError } = require('../utils/handle-error')
const { verifyToken } = require('../utils/handle-jwt')


const authMiddleware = async (req, res, next) => {
    try {

        if (!req.headers.authorization) {
            handleHttpError(res, 'NESESITAS_UNA_SESION', 401)
            return
        }

        const token = req.headers.authorization.split(' ').pop()
        const dataToken = await verifyToken(token)

        // console.log("TOKEN2: "+JSON.stringify(dataToken));

        if (!dataToken.id) {
            handleHttpError(res, 'ERROR_ID_TOKEN', 401)
            return
        }

        /* -------------------------------------------------------------------------- */
        /*                         consulta 1 : usuario por id                        */
        /* -------------------------------------------------------------------------- */
        const usuarioData = await Usuario.findOne({
            where: { id_usuario: dataToken.id },
            attributes: ['id_usuario', 'nombre_usuario', 'contrasenia_hash', 'id_persona', 'activo']
        });

        if (!usuarioData) {
            return handleHttpError(res, 'USUARIO_NO_ENCONTRADO', 404);
        }

        const usuario = usuarioData.get({ plain: true });
        /* -------------------------------------------------------------------------- */

        /* -------------------------------------------------------------------------- */
        /*                consulta 2 : consulta roles de usuario por id               */
        /* -------------------------------------------------------------------------- */
        const rolesData = await usuarioData.getRoles();
        const roles = rolesData.map(rol => rol.nombre_rol);
        /* -------------------------------------------------------------------------- */

        /* ------------------------ estruturar json con roles ----------------------- */
        usuarioRoles = { ...usuario, roles }

        /* -------------- crear variable en (req) para usuario logeado -------------- */
        // console.log("===========");
        // console.log("req Usuario: " + JSON.stringify(usuarioRoles));
        // console.log("===========");

        req.usuario = usuarioRoles

        next();

    } catch (error) {
        console.log(error);
        return handleHttpError(res, 'NO_TIENE_SESION', 401)
    }
}

module.exports = authMiddleware