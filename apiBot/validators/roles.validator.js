const { check } = require('express-validator');
const validateResult = require('../utils/handle-validator')

const validatorCreateRol = [
    check('nombre_rol', 'el nombre de rol es obligatorio').exists().notEmpty().withMessage('el nombre de rol es obligatorio'),
    check('descripcion', 'la descripcion es obligatoria').exists().withMessage('la descripcion es obligatorio'),
    (req, res, next) => { return validateResult(req, res, next) }
]

const validatorUpdateRol = [
    check('nombre_rol', 'el nombre de rol es obligatorio').optional(),
    check('descripcion', 'la descripcion es opcional').optional(),
    (req, res, next) => { return validateResult(req, res, next) }
]


module.exports = { validatorCreateRol, validatorUpdateRol }