const { handleHttpError } = require('../utils/handle-error');
const { matchedData } = require('express-validator');

const { handleResponseJson } = require('../utils/handle-response-json');

const Curso = require('../models/curso.model');
const Usuario = require('../models/usuario.model');
require('../models/cursos-agentes.model'); // <-- ¡IMPORTANTE! Esto ejecuta y registra las relaciones belongsToMany
const { Op, Sequelize } = require('sequelize');
const CursoAgente = require('../models/cursos-agentes.model');

const getCursosAgente = async (req, res) => {

    try {
        // Asumimos que el id del usuario viene por los parámetros de la ruta
        // Por ejemplo: GET /cursos-agentes/:id_usuario
        const { id_usuario } = req.params;

        // Parámetros de paginación desde query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'id_curso';
        const sortOrder = req.query.sortOrder || 'desc';

        // Condición de búsqueda: busca en los campos de texto del curso
        const where = search ? {
            [Op.or]: [
                { nombre_curso: { [Op.iLike]: `%${search}%` } },
                { descripcion_corta: { [Op.iLike]: `%${search}%` } },
                { palabras_clave: { [Op.iLike]: `%${search}%` } },
                { nivel: { [Op.iLike]: `%${search}%` } },
                { modalidad: { [Op.iLike]: `%${search}%` } },
                // Para campos numéricos/decimales, PostgreSQL requiere castearlos a texto antes de usar iLike
                Sequelize.where(Sequelize.cast(Sequelize.col('precio'), 'varchar'), {
                    [Op.iLike]: `%${search}%`
                }),
            ]
        } : {};

        const { count: totalItems, rows: cursos } = await Curso.findAndCountAll({
            where,
            include: [{
                model: Usuario,
                where: { id_usuario: id_usuario },
                attributes: [], // Poniendo un arreglo vacío, Sequelize no incluye la tabla intermedia en el JSON
                through: { attributes: [] } // Poniendo un arreglo vacío, Sequelize no incluye la tabla intermedia en el JSON
            }],
            limit,
            offset,
            order: [[sortBy, sortOrder.toUpperCase()]]
        });

        // Meta de paginación para que el frontend sepa cuántas páginas hay
        const paginacion = {
            total: totalItems,
            page,
            limit,
            totalPages: Math.ceil(totalItems / limit)
        };

        handleResponseJson(res, 200, cursos, 'CURSOS_AGENTE_OBTENIDOS', paginacion);

    } catch (error) {
        handleHttpError(res, error, 'OBTENER_CURSOS_AGENTE');
    }

};

const asignarCursoAgente = async (req, res) => {
    try {

        const datosAsignacion = matchedData(req);

        const crearAsignacionCurso = await CursoAgente.create(datosAsignacion);

        handleResponseJson(res, 201, crearAsignacionCurso, 'ASIGNACION_CURSO_AGENTE_CREADA');

    } catch (error) {
        handleHttpError(res, error, 'ASIGNAR_CURSO_AGENTE');
    }
};

module.exports = { getCursosAgente, asignarCursoAgente }