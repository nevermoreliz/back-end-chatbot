const { check } = require('express-validator');
const validateResult = require('../utils/handle-validator')

const validatorRegistro = [
    check('id_persona').exists().withMessage('El ID de persona es requerido')
        .notEmpty().withMessage('El ID de persona no puede estar vacío')
        .isNumeric().withMessage('El ID de persona debe ser numérico'),
    check('nombre_usuario').exists().withMessage('El nombre de usuario es requerido')
        .notEmpty().withMessage('El nombre de usuario no puede estar vacío'),
    check('contrasenia_hash')
        .exists().withMessage('La contraseña es requerida')
        .notEmpty().withMessage('La contraseña no puede estar vacía')
        .isLength({ min: 3, max: 15 }).withMessage('La contraseña debe tener entre 3 y 15 caracteres'),
    (req, res, next) => { return validateResult(req, res, next) }
]

const validatorLogin = [
    check('nombre_usuario').exists().withMessage('El nombre de usuario es requerido')
        .notEmpty().withMessage('El nombre de usuario no puede estar vacío'),
    check('contrasenia_hash')
        .exists().withMessage('La contraseña es requerida')
        .notEmpty().withMessage('La contraseña no puede estar vacía')
        .isLength({ min: 3, max: 15 }).withMessage('La contraseña debe tener entre 3 y 15 caracteres'),
    (req, res, next) => { return validateResult(req, res, next) }
]

module.exports = { validatorRegistro, validatorLogin }