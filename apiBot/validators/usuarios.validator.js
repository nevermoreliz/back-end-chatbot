const { check } = require('express-validator');
const validateResult = require('../utils/handle-validator')

const validatorUsuario = [
    check('id_persona', 'id persona es obligatorio').exists().notEmpty().isNumeric().withMessage('el id persona debe ser numerico'),
    check('nombre_usuario', 'el nombre de usuario es obligatorio').exists().notEmpty().withMessage('el nombre de usuario es obligatorio'),
    check('contrasenia_hash', 'la contraseña es obligatorio').exists().notEmpty().isLength({ min: 3, max: 15 }).withMessage('la contraseña debe tener entre 3 y 15 caracteres'),
    check('activo').optional().isBoolean().withMessage('el activo debe ser booleano'),
    (req, res, next) => { return validateResult(req, res, next) }
]

const validatorUpdateUsuario = [
    check('nombre_usuario', 'el nombre de usuario es obligatorio').exists().notEmpty().withMessage('el nombre de usuario es obligatorio'),
    check('contrasenia_hash', 'la contraseña es obligatorio').exists().notEmpty().isLength({ min: 3, max: 15 }).withMessage('la contraseña debe tener entre 3 y 15 caracteres'),
    (req, res, next) => { return validateResult(req, res, next) }
]


module.exports = { validatorUsuario, validatorUpdateUsuario }