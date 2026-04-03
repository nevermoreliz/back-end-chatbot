const { check } = require('express-validator');
const validateResult = require('../utils/handle-validator')

const validatorCreatePersona = [
    check('nombre').exists().notEmpty().isLength({ min: 3, max: 50 }).withMessage('el nombre debe tener entre 3 y 50 caracteres'),
    check('materno').exists().notEmpty().isLength({ min: 3, max: 50 }).withMessage('el apellido materno debe tener entre 3 y 50 caracteres'),
    check('paterno').exists().notEmpty().isLength({ min: 3, max: 50 }).withMessage('el apellido paterno debe tener entre 3 y 50 caracteres'),
    check('correo').exists().notEmpty().isEmail().withMessage('el correo no es valido'),
    check('ci').exists().notEmpty().isLength({ min: 5, max: 15 }).withMessage('el ci debe tener entre 5 y 15 caracteres'),
    check('celular').exists().notEmpty().isLength({ min: 8, max: 10 }).withMessage('el celular debe tener entre 8 y 10 caracteres').isNumeric().withMessage('el celular debe ser numerico'),
    check('img').optional(),
    check('sexo').exists().notEmpty().isIn(['M', 'F']).withMessage('el sexo debe ser M o F'),
    check('fecha_nacimiento').exists().notEmpty().isDate().withMessage('la fecha de nacimiento debe ser una fecha valida'),
    check('notificaciones_chatbot').optional().isBoolean().withMessage('las notificaciones del chatbot deben ser booleanas'),
    check('activo').optional().isBoolean().withMessage('el activo debe ser booleano'),
    (req, res, next) => { return validateResult(req, res, next) }
]

const validatorUpdatePersona = [
    check('id_persona').optional().isNumeric(),
    check('nombre').optional().isLength({ min: 3, max: 50 }).withMessage('el nombre debe tener entre 3 y 50 caracteres'),
    check('materno').optional().isLength({ min: 3, max: 50 }).withMessage('el apellido materno debe tener entre 3 y 50 caracteres'),
    check('paterno').optional().isLength({ min: 3, max: 50 }).withMessage('el apellido paterno debe tener entre 3 y 50 caracteres'),
    check('correo').optional().isEmail().withMessage('el correo no es valido'),
    check('ci').optional().isLength({ min: 5, max: 15 }).withMessage('el ci debe tener entre 5 y 15 caracteres'),
    check('celular').optional().isLength({ min: 8, max: 10 }).withMessage('el celular debe tener entre 8 y 10 caracteres').isNumeric().withMessage('el celular debe ser numerico'),
    check('img').optional(),
    check('sexo').optional().isIn(['M', 'F']).withMessage('el sexo debe ser M o F'),
    check('fecha_nacimiento').optional().isDate().withMessage('la fecha de nacimiento debe ser una fecha valida'),
    check('notificaciones_chatbot').optional().isBoolean().withMessage('las notificaciones del chatbot deben ser booleanas'),
    check('activo').optional().isBoolean().withMessage('el activo debe ser booleano'),
    (req, res, next) => { return validateResult(req, res, next) }
]

module.exports = { validatorCreatePersona, validatorUpdatePersona }