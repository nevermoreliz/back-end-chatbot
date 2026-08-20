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
        check('descripcion').optional().isString().withMessage('La descripción debe ser texto').trim(),
        check('descripcion_corta').optional().isString().withMessage('La descripción corta debe ser texto').trim().isLength({ max: 500 }).withMessage('La descripción corta no puede tener más de 500 caracteres'),
        check('dirigido_a').optional().isString().withMessage('El campo dirigido_a debe ser texto').trim(),
        check('horario').optional().isString().withMessage('El horario debe ser texto').trim(),
        check('requisitos').optional().isString().withMessage('Los requisitos deben ser texto').trim(),
        check('beneficios').optional().isString().withMessage('Los beneficios deben ser texto').trim(),
        check('incluye').optional().isString().withMessage('El campo incluye debe ser texto').trim(),
        check('idioma').optional().isString().withMessage('El idioma debe ser texto').trim().isLength({ max: 5 }).withMessage('El idioma no puede tener más de 5 caracteres'),

        // ==========================================
        // 3. NÚMEROS: DURACIÓN, CARGA Y PARTICIPANTES
        // ==========================================
        check('duracion_semanas').optional().isInt({ min: 1 }).withMessage('La duración en semanas debe ser un número entero mayor a 0'),
        check('carga_horaria').optional().isInt({ min: 1 }).withMessage('La carga horaria debe ser un número entero mayor a 0'),
        check('max_participantes').optional().isInt({ min: 1 }).withMessage('El máximo de participantes debe ser un número entero mayor a 0'),
        check('min_participantes').optional().isInt({ min: 1 }).withMessage('El mínimo de participantes debe ser un número entero mayor a 0'),
        check('min_estudiantes_precio_grupal').optional().isInt({ min: 1 }).withMessage('El mínimo de estudiantes para precio grupal debe ser un número entero mayor a 0'),

        // ==========================================
        // 4. PRECIOS Y DESCUENTOS (Opcionales)
        // ==========================================
        check('precio_promocional').optional().isFloat({ min: 0 }).withMessage('El precio promocional debe ser un número positivo'),
        check('descuento').optional().isFloat({ min: 0, max: 100 }).withMessage('El descuento debe ser un número entre 0 y 100'),
        check('precio_grupal').optional().isFloat({ min: 0 }).withMessage('El precio grupal debe ser un número positivo'),

        // ==========================================
        // 5. FECHAS (TIMESTAMP y DATE)
        // ==========================================
        // Usamos isISO8601 para soportar tanto YYYY-MM-DD como fechas con hora
        check('fecha_inicio_descuento').optional().isDate().withMessage('La fecha de inicio de descuento debe ser una fecha válida'),
        check('fecha_fin_descuento').optional().isDate().withMessage('La fecha de fin de descuento debe ser una fecha válida'),
        check('fecha_inicio').optional().isDate().withMessage('La fecha de inicio debe ser una fecha válida'),
        check('fecha_fin').optional().isDate().withMessage('La fecha de fin debe ser una fecha válida'),
        check('fecha_limite_inscripcion').optional().isDate().withMessage('La fecha límite de inscripción debe ser una fecha válida'),
        check('fecha_inicio_clases').optional().isDate().withMessage('La fecha de inicio de clases debe ser una fecha válida'),

        // ==========================================
        // 6. ENUMS Y BOOLEANOS
        // ==========================================
        check('modalidad')
            .optional().isString().withMessage('La modalidad debe ser texto')
            .isIn(['Presencial', 'Virtual', 'Hibrido']).withMessage('Modalidad inválida'),

        check('nivel')
            .optional().isString().withMessage('El nivel debe ser texto')
            .isIn(['Basico', 'Intermedio', 'Avanzado']).withMessage('Nivel inválido'),

        check('certificado_incluido').optional().isBoolean().withMessage('El campo certificado_incluido debe ser booleano'),
        check('activo').optional().isBoolean().withMessage('El campo activo debe ser booleano'),
        check('destacado').optional().isBoolean().withMessage('El campo destacado debe ser booleano'),

        // ==========================================
        // 7. URLs Y MULTIMEDIA
        // ==========================================
        check('url_afiche')
            .optional({ checkFalsy: true })
            .isURL().withMessage('La URL del afiche no es válida')
            .isLength({ max: 255 }).withMessage('La URL del afiche no puede tener más de 255 caracteres'),
        check('url_contenidos_pdf')
            .optional({ checkFalsy: true })
            .isURL().withMessage('La URL de los contenidos en PDF no es válida')
            .isLength({ max: 255 }).withMessage('La URL de los contenidos en PDF no puede tener más de 255 caracteres'),
        check('url_video_promocional')
            .optional({ checkFalsy: true })
            .isURL().withMessage('La URL del video promocional no es válida')
            .isLength({ max: 255 }).withMessage('La URL del video promocional no puede tener más de 255 caracteres'),

        // ==========================================
        // 8. CAMPOS PARA DIVULGACIÓN Y SEO (Bot v2)
        // ==========================================
        check('palabras_clave').optional().isString().withMessage('Las palabras clave deben ser texto').trim(),
        check('mensaje_bienvenida').optional().isString().withMessage('El mensaje de bienvenida debe ser texto').trim(),

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