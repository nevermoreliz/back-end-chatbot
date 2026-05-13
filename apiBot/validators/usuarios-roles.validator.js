const { check } = require('express-validator');
const validateResult = require('../utils/handle-validator')

const validatorUsuarioRoles = [
    // Campos OBLIGATORIOS
    check('id_usuario', 'id usuario es obligatorio').exists().notEmpty().isNumeric().withMessage('el id usuario debe ser numerico'),
    check('id_rol', 'id rol es obligatorio').exists().notEmpty().isNumeric().withMessage('el id rol debe ser numerico'),

    // Campos OPCIONALES
    // Si vienen en el request se validan, si no, se ignoran.
    check('activo').optional().isBoolean().withMessage('el campo activo debe ser booleano'),
    check('fecha_asignacion').optional().isISO8601().withMessage('la fecha de asignacion debe ser una fecha valida'),

    // IMPORTANTE: created_at y updated_at NO se validan porque el cliente no debe enviarlos.
    // La Base de Datos (Sequelize) se encarga de ponerlos automáticamente.

    (req, res, next) => { return validateResult(req, res, next) }
]


module.exports = { validatorUsuarioRoles }