const authMiddleware = require('./session.middleware');
const { handleHttpError } = require('../utils/handle-error');

// 1. Roles exactos de la Base de Datos
const ROLES = {
    ADMIN: 'administrador',
    AGENTE: 'agente',
    USUARIO: 'usuario registrado'
};

// 2. Niveles de Acceso comunes para las rutas
const ACCESS = {
    PUBLIC: 'public', // Para rutas sin auth
    ALL_USERS: [ROLES.ADMIN, ROLES.AGENTE, ROLES.USUARIO],
    STAFF: [ROLES.ADMIN, ROLES.AGENTE],
    ADMIN_ONLY: [ROLES.ADMIN]
};

/**
 * Middleware para requerir autenticación básica de sesión
 */
const requireAuth = authMiddleware;

/**
 * Middleware dinámico para requerir roles específicos o niveles de acceso.
 * Soporta múltiples argumentos o un array.
 * Ejemplo de uso:
 *   requireRole(ACCESS.STAFF)
 *   requireRole('administrador', 'agente')
 */
const requireRole = (...allowedRolesOrLevels) => {
    // Aplanar los argumentos en un solo array plano de roles permitidos
    const allowedRoles = allowedRolesOrLevels.flat();

    return (req, res, next) => {
        // 1. Ejecutar de forma transparente el middleware de sesión primero
        authMiddleware(req, res, () => {
            try {
                const { usuario } = req;
                if (!usuario || !usuario.roles) {
                    return handleHttpError(res, "USUARIO_SIN_PERMISOS", 403);
                }

                const rolesByUser = usuario.roles;
                
                // Verificar si el usuario tiene al menos uno de los roles permitidos
                const hasPermission = allowedRoles.some((rol) => rolesByUser.includes(rol));

                if (!hasPermission) {
                    return handleHttpError(res, "USUARIO_SIN_PERMISOS", 403);
                }

                next();
            } catch (e) {
                console.error("Error en requireRole guard:", e);
                return handleHttpError(res, "ERROR_PERMISOS", 403);
            }
        });
    };
};

module.exports = {
    ROLES,
    ACCESS,
    requireAuth,
    requireRole
};
