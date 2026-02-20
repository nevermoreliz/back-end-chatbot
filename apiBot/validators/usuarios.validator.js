const { check } = require('express-validator');
const validateResult = require('../utils/handle-validator')

const validatorUsuario = [
    check('id_persona', 'id persona es obligatorio').exists().notEmpty().isNumeric(),
    check('nombre_usuario', 'el nombre de usuario es obligatorio').exists().notEmpty(),
    check('contrasenia_hash', 'la contraseña es obligatorio').exists().notEmpty().isLength({ min: 3, max: 15 }),
    check('activo').optional(),
    (req, res, next) => { return validateResult(req, res, next) }
]

const validatorUpdateUsuario = [
    check('nombre_usuario', 'el nombre de usuario es obligatorio').exists().notEmpty(),
    check('contrasenia_hash', 'la contraseña es obligatorio').exists().notEmpty().isLength({ min: 3, max: 15 }),
    (req, res, next) => { return validateResult(req, res, next) }
]


module.exports = { validatorUsuario, validatorUpdateUsuario }