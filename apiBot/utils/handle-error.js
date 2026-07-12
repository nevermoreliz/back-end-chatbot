const {
    BaseError,
    UniqueConstraintError,
    ValidationError,
    ForeignKeyConstraintError,
    ConnectionError,
    TimeoutError,
    DatabaseError
} = require('sequelize');

// ─────────────────────────────────────────────────────────────────
// handleHttpError: UNA SOLA función para manejar TODOS los errores.
// ─────────────────────────────────────────────────────────────────
//
// Tiene DOS modos de uso:
//
//   MODO 1 (string) — Errores manuales donde TÚ defines el mensaje:
//     handleHttpError(res, 'PERSONA_NO_ENCONTRADA', 404)
//     → { ok: false, error: 'PERSONA_NO_ENCONTRADA' }
//
//   MODO 2 (Error object) — Errores de Sequelize atrapados en el catch:
//     handleHttpError(res, error, 'CREAR_CURSO')
//     → Clasifica automáticamente: duplicado (409), FK (400), etc.
//
// ¿Cómo sabe qué modo usar?
//   typeof message === 'string'  → MODO 1
//   message instanceof Error     → MODO 2
// ─────────────────────────────────────────────────────────────────

const handleHttpError = (res, message = 'Algo Sucedio', code = 500, extra = {}) => {

    // ─── MODO 2: Recibimos un objeto Error (típicamente del catch) ───
    // El tercer parámetro "code" aquí actúa como "contexto" (string)
    if (message instanceof Error) {
        const error = message;                          // renombramos para claridad
        const contexto = typeof code === 'string'       // el 3er param es el contexto
            ? code
            : 'OPERACION';

        return _handleSequelizeError(res, error, contexto);
    }

    // ─── MODO 1: Recibimos un string (uso manual tradicional) ───
    // Funciona exactamente igual que siempre
    res.status(code).json({
        ok: false,
        error: message,
        ...extra
    });
};


// ─────────────────────────────────────────────────────────────────
// _handleSequelizeError: función PRIVADA (no se exporta).
// ─────────────────────────────────────────────────────────────────
// Se llama internamente cuando handleHttpError recibe un Error.
// Clasifica el error de Sequelize y responde con el código HTTP
// y mensaje apropiado.
//
// El _ al inicio es convención para indicar que es PRIVADA,
// solo se usa dentro de este archivo.
// ─────────────────────────────────────────────────────────────────

const _handleSequelizeError = (res, error, contexto) => {

    // ─── Duplicado (UniqueConstraintError) ───
    // Ejemplo: nombre_curso ya existe en la tabla
    // HTTP 409 = Conflict
    // IMPORTANTE: Va ANTES de ValidationError porque Unique hereda de Validation
    if (error instanceof UniqueConstraintError) {
        const campos = error.errors.map(e => e.path);
        const valores = error.errors.map(e => `${e.path}: '${e.value}'`);
        console.log(`[${contexto}] Duplicado en: ${valores.join(', ')}`);

        return res.status(409).json({
            ok: false,
            error: `${contexto}_DUPLICADO`,
            detalle: `Ya existe un registro con: ${valores.join(', ')}`,
            campos
        });
    }

    // ─── FK inválida (ForeignKeyConstraintError) ───
    // Ejemplo: id_categoria = 999 pero no existe la categoría 999
    // HTTP 400 = Bad Request
    if (error instanceof ForeignKeyConstraintError) {
        const constraint = error.index || 'referencia desconocida';
        console.log(`[${contexto}] FK inválida: ${constraint}`);

        return res.status(400).json({
            ok: false,
            error: `${contexto}_REFERENCIA_INVALIDA`,
            detalle: 'La referencia proporcionada no existe en la base de datos',
            constraint
        });
    }

    // ─── Validación del modelo (ValidationError) ───
    // Ejemplo: campo requerido enviado como null
    // HTTP 400 = Bad Request
    if (error instanceof ValidationError) {
        const errores = error.errors.map(e => ({
            campo: e.path,
            mensaje: e.message,
            tipo: e.type
        }));
        console.log(`[${contexto}] Validación fallida:`, errores);

        return res.status(400).json({
            ok: false,
            error: `${contexto}_VALIDACION_FALLIDA`,
            detalle: 'Los datos no cumplen con las validaciones requeridas',
            errores
        });
    }

    // ─── Conexión (ConnectionError) ───
    // Ejemplo: la base de datos se cayó, host no encontrado
    // HTTP 503 = Service Unavailable
    if (error instanceof ConnectionError) {
        console.log(`[${contexto}] Error de conexión a BD:`, error.message);
        return res.status(503).json({
            ok: false,
            error: 'ERROR_CONEXION_BASE_DATOS'
        });
    }

    // ─── Timeout (TimeoutError) ───
    // Ejemplo: la consulta tardó demasiado
    // HTTP 504 = Gateway Timeout
    if (error instanceof TimeoutError) {
        console.log(`[${contexto}] Timeout en BD:`, error.message);
        return res.status(504).json({
            ok: false,
            error: 'ERROR_TIMEOUT_BASE_DATOS'
        });
    }

    // ─── Error SQL genérico (DatabaseError) ───
    // Ejemplo: tipo de dato incorrecto, SQL mal formado
    // HTTP 500 = Internal Server Error
    if (error instanceof DatabaseError) {
        console.log(`[${contexto}] Error de BD:`, error.message);
        return res.status(500).json({
            ok: false,
            error: `ERROR_${contexto}`
        });
    }

    // ─── CATCH-ALL: cualquier otro error de Sequelize (BaseError) ───
    // BaseError es el PADRE de TODOS los errores de Sequelize.
    // Si Sequelize agrega nuevos tipos en el futuro, caen aquí
    // automáticamente sin necesidad de agregar más casos.
    if (error instanceof BaseError) {
        console.log(`[${contexto}] Error de Sequelize no clasificado:`, error.message);
        return res.status(500).json({
            ok: false,
            error: `ERROR_${contexto}`
        });
    }

    // ─── Error que NO es de Sequelize ───
    // TypeError, ReferenceError, o cualquier error de JS
    console.log(`[${contexto}] Error inesperado:`, error.message);
    return res.status(500).json({
        ok: false,
        error: `ERROR_${contexto}`
    });
};


module.exports = { handleHttpError }