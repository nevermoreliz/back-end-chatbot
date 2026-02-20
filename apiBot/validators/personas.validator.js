const { check } = require('express-validator');
const validateResult = require('../utils/handle-validator')

const validatorCreatePersona = [
    check('nombre').exists().notEmpty(),
    check('materno').exists().notEmpty(),
    check('paterno').exists().notEmpty(),
    check('correo').exists().notEmpty(),
    check('ci').exists().notEmpty(),
    check('celular').exists().notEmpty(),
    check('img').optional(),
    check('sexo').exists().notEmpty(),
    check('fecha_nacimiento').exists().notEmpty(),
    check('notificaciones_chatbot').optional(),
    check('activo').optional(),
    (req, res, next) => { return validateResult(req, res, next) }
]

const validatorUpdatePersona = [
    check('id_persona').optional(),
    check('nombre').optional(),
    check('materno').optional(),
    check('paterno').optional(),
    check('correo').optional(),
    check('ci').optional(),
    check('celular').optional(),
    check('img').optional(),
    check('sexo').optional(),
    check('fecha_nacimiento').optional(),
    check('notificaciones_chatbot').optional(),
    check('activo').optional(),
    (req, res, next) => { return validateResult(req, res, next) }
]

module.exports = { validatorCreatePersona, validatorUpdatePersona }