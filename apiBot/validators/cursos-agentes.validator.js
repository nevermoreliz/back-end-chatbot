const { check } = require('express-validator');
const validateResult = require('../utils/handle-validator')

const getCursoAgenteValidacion = (isEdit = false) => {
    return [

        // ==========================================
        // 1. CAMPOS OBLIGATORIOS (Opcionales en Edición)
        // ==========================================
        check('id_usuario')
            .if(() => !isEdit)
            .notEmpty().withMessage('El id_usuario es obligatorio')
            .isInt().withMessage('El id_usuario debe ser un número entero')
            .toInt(),

        check('id_curso')
            .if(() => !isEdit)
            .notEmpty().withMessage('El id_curso es obligatorio')
            .isInt().withMessage('El id_curso debe ser un número entero')
            .toInt(),

        // ==========================================
        // 2. CAMPOS OPCIONALES / CON VALOR POR DEFECTO
        // ==========================================
        check('rol_agente')
            .optional({ nullable: true })
            .isIn(['Responsable', 'Apoyo', 'Supervisor'])
            .withMessage('El rol_agente debe ser uno de los siguientes: Responsable, Apoyo, Supervisor'),

        check('activo')
            .optional({ nullable: true })
            .isBoolean().withMessage('El campo activo debe ser un valor booleano (true o false)')
            .toBoolean(),

        check('fecha_asignacion')
            .optional({ nullable: true })
            .isISO8601().withMessage('La fecha_asignacion debe ser un formato de fecha o ISO valido (ej. YYYY-MM-DD)'),

        // Lanzar middleware de validación
        validateResult
    ];
};

module.exports = { getCursoAgenteValidacion }