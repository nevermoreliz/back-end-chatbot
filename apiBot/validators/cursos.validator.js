const { check } = require('express-validator');
const validateResult = require('../utils/handle-validator')

const getCursoValidacion = (isEdit = false) => {
    return [
        // ==========================================
        // 1. CAMPOS OBLIGATORIOS (Opcionales en Edición)
        // ==========================================
        check('id_categoria')
            .if(() => !isEdit).notEmpty().withMessage('La categoría es obligatoria')
            .isInt().withMessage('El id_categoria debe ser un número entero'),

        check('nombre_curso')
            .if(() => !isEdit).notEmpty().withMessage('El nombre del curso es obligatorio')
            .if(() => isEdit).optional().notEmpty().withMessage('El nombre no puede estar vacío')
            .isString().trim().isLength({ max: 200 }).withMessage('Máximo 200 caracteres'),

        check('version')
            .if(() => !isEdit).notEmpty().withMessage('La versión es obligatoria')
            .if(() => isEdit).optional().notEmpty()
            .isString().trim().isLength({ max: 10 }).withMessage('Máximo 10 caracteres'),

        check('anio')
            .if(() => !isEdit).notEmpty().withMessage('El año es obligatorio')
            .if(() => isEdit).optional()
            .isInt({ min: 2000, max: new Date().getFullYear() + 5 }) // Validación dinámica según tu BD
            .withMessage('Año inválido'),

        check('precio')
            .if(() => !isEdit).notEmpty().withMessage('El precio es obligatorio')
            .if(() => isEdit).optional()
            .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),

        // ==========================================
        // 2. TEXTOS Y DESCRIPCIONES (Opcionales)
        // ==========================================
        check('descripcion').optional().isString().trim(),
        check('descripcion_corta').optional().isString().trim().isLength({ max: 500 }),
        check('dirigido_a').optional().isString().trim(),
        check('horario').optional().isString().trim(),
        check('requisitos').optional().isString().trim(),
        check('beneficios').optional().isString().trim(),
        check('incluye').optional().isString().trim(),
        check('idioma').optional().isString().trim().isLength({ max: 5 }),

        // ==========================================
        // 3. NÚMEROS: DURACIÓN, CARGA Y PARTICIPANTES
        // ==========================================
        check('duracion_semanas').optional().isInt({ min: 1 }),
        check('carga_horaria').optional().isInt({ min: 1 }),
        check('max_participantes').optional().isInt({ min: 1 }),
        check('min_participantes').optional().isInt({ min: 1 }),
        check('min_estudiantes_precio_grupal').optional().isInt({ min: 1 }),

        // ==========================================
        // 4. PRECIOS Y DESCUENTOS (Opcionales)
        // ==========================================
        check('precio_promocional').optional().isFloat({ min: 0 }),
        check('descuento').optional().isFloat({ min: 0, max: 100 }),
        check('precio_grupal').optional().isFloat({ min: 0 }),

        // ==========================================
        // 5. FECHAS (TIMESTAMP y DATE)
        // ==========================================
        // Usamos isISO8601 para soportar tanto YYYY-MM-DD como fechas con hora
        check('fecha_inicio_descuento').optional().isDate(),
        check('fecha_fin_descuento').optional().isDate(),
        check('fecha_inicio').optional().isDate(),
        check('fecha_fin').optional().isDate(),
        check('fecha_limite_inscripcion').optional().isDate(),
        check('fecha_inicio_clases').optional().isDate(),

        // ==========================================
        // 6. ENUMS Y BOOLEANOS
        // ==========================================
        check('modalidad')
            .optional().isString()
            .isIn(['Presencial', 'Virtual', 'Hibrido']).withMessage('Modalidad inválida'),

        check('nivel')
            .optional().isString()
            .isIn(['Basico', 'Intermedio', 'Avanzado']).withMessage('Nivel inválido'),

        check('certificado_incluido').optional().isBoolean(),
        check('activo').optional().isBoolean(),
        check('destacado').optional().isBoolean(),

        // ==========================================
        // 7. URLs Y MULTIMEDIA
        // ==========================================
        check('url_afiche').optional({ checkFalsy: true }).isURL().isLength({ max: 255 }),
        check('url_contenidos_pdf').optional({ checkFalsy: true }).isURL().isLength({ max: 255 }),
        check('url_video_promocional').optional({ checkFalsy: true }).isURL().isLength({ max: 255 }),

        // ==========================================
        // 8. CAMPOS PARA DIVULGACIÓN Y SEO (Bot v2)
        // ==========================================
        check('palabras_clave').optional().isString().trim(),
        check('mensaje_bienvenida').optional().isString().trim(),

        // Validación personalizada para JSONB (Debe ser un array)
        check('pregunta_frecuente')
            .optional()
            .isArray().withMessage('Debe ser un arreglo (array) de preguntas y respuestas')
            .custom((value) => {
                // Verificar que cada objeto del array tenga 'q' y 'a'
                for (let item of value) {
                    if (!item.q || !item.a || typeof item.q !== 'string' || typeof item.a !== 'string') {
                        throw new Error('Cada pregunta frecuente debe tener el formato: {"q": "pregunta", "a": "respuesta"}');
                    }
                }
                return true;
            }),

        // Lanzar middleware de validación
        validateResult
    ];
};

module.exports = { getCursoValidacion }