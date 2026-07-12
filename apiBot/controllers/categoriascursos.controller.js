const { handleHttpError } = require('../utils/handle-error');
const { matchedData } = require('express-validator');

const { handleResponseJson } = require('../utils/handle-response-json');

const Curso = require('../models/curso.model');
const { Op } = require('sequelize');
const Categoriacurso = require('../models/categoriacurso.model');

const getCategoriasAll = async (req, res) => {

    try {

        const categorias = await Categoriacurso.findAll();
        if (!categorias) {
            return handleHttpError(res, 'CATEGORIAS_NO_ENCONTRADAS', 404);
        }

        handleResponseJson(res, 200, categorias, 'CATEGORIAS_OBTENIDAS');

    } catch (error) {
        handleHttpError(res, error, 'OBTENER_CATEGORIAS');
    }

};

const getCategorias = async (req, res) => {
    try {

        // Parámetros de paginación desde query params
        // Ejemplo: GET /cursos?page=2&limit=5&search=react&sortBy=nombre_curso&sortOrder=asc
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'id_curso';
        const sortOrder = req.query.sortOrder || 'desc';

        // Condición de búsqueda: busca en los campos de texto del curso
        // Op.iLike = búsqueda sin importar mayúsculas/minúsculas (PostgreSQL)
        const where = search ? {
            [Op.or]: [
                { nombre_curso: { [Op.iLike]: `%${search}%` } },
                { descripcion_corta: { [Op.iLike]: `%${search}%` } },
                { palabras_clave: { [Op.iLike]: `%${search}%` } },
            ]
        } : {};

        const { count: totalItems, rows: cursos } = await Curso.findAndCountAll({
            where,
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

        handleResponseJson(res, 200, cursos, 'CURSOS_OBTENIDOS', paginacion);

    } catch (error) {
        handleHttpError(res, error, 'OBTENER_CURSOS');
    }
};

const createCategoria = async (req, res) => {

    try {
        const datosCurso = matchedData(req);

        const cursoCreado = await Curso.create(datosCurso);
        handleResponseJson(res, 201, cursoCreado, 'CURSO_CREADO');

    } catch (error) {
        // handleHttpError detecta que recibe un Error (no string)
        // y clasifica automáticamente: duplicado (409), FK (400),
        // validación (400), conexión (503), o error real (500)
        handleHttpError(res, error, 'CREAR_CURSO');
    }

};

const updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Verificar que el curso existe ANTES de actualizar
        const cursoExistente = await Curso.findByPk(id);

        if (!cursoExistente) {
            return handleHttpError(res, 'CURSO_NO_ENCONTRADO', 404);
        }

        // 2. Extraer solo los campos validados del body
        const datosCurso = matchedData(req);

        // 3. Actualizar el curso
        await Curso.update(datosCurso, { where: { id_curso: id } });

        // 4. Obtener el curso actualizado para devolverlo al frontend
        //    ¿Por qué no usar cursoExistente? Porque tiene los datos VIEJOS.
        //    Necesitamos leer de nuevo para obtener los valores actualizados.
        const cursoActualizado = await Curso.findByPk(id);

        handleResponseJson(res, 200, cursoActualizado, 'CURSO_ACTUALIZADO');

    } catch (error) {
        handleHttpError(res, error, 'ACTUALIZAR_CURSO');
    }
};

const deleteCategoria = async (req, res) => {
    try {

        const { id } = req.params;

        // 1. Verificar que el curso existe ANTES de actualizar
        const cursoExistente = await Curso.findByPk(id);

        if (!cursoExistente) {
            return handleHttpError(res, 'CURSO_NO_ENCONTRADO', 404);
        }

        // 2. Borrado lógico: no se elimina el registro, solo se marca como inactivo
        await Curso.update({ activo: false }, { where: { id_curso: id } });

        handleResponseJson(res, 200, null, 'CURSO_ELIMINADO');

    } catch (error) {
        handleHttpError(res, error, 'ELIMINAR_CURSO');
    }
};


module.exports = { getCategoriasAll }