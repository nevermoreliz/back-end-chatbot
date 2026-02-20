const { handleHttpError } = require('../utils/handle-error');
const { matchedData } = require('express-validator');

const { handleResponseJsonMsg, handleResponseJson } = require('../utils/handle-response-json');

const { uploadMiddleware, deleteFile } = require("../utils/handle-storage");
const util = require("util");
const path = require('path');
const fs = require("fs");
const Persona = require('../models/persona.model');

const PUBLIC_URL = process.env.PUBLIC_URL;

const getPersona = async (req, res) => {

    try {
        // Obtener el ID de la persona desde los parámetros de la ruta
        const { id } = req.params;

        // Buscar la persona en la base de datos
        const persona = await Persona.findByPk(id);

        // Verificar si la persona existe
        if (!persona) {
            return handleHttpError(res, 'PERSONA_NO_ENCONTRADA', 404);
        }

        // Devolver la información de la persona encontrada
        return handleResponseJson(res, 200, persona, 'PERSONA_ENCONTRADA_EXITOSAMENTE');

    } catch (error) {
        console.log('Error al buscar persona:', error);
        return handleHttpError(res, 'ERROR_BUSQUEDA_PERSONA', 500);
    }

};

const getPersonas = async (req, res) => {
    try {

        try {
            const personas = await Persona.findAll()
            handleResponseJson(res, 200, personas, 'LISTA_PERSONAS')
        } catch (dbError) {
            console.log("Error al obtener lista personas:", dbError.message);
            handleHttpError(res, "ERROR_LISTAR_PERSONAS", 500);
        }


    } catch (error) {
        // console.log(error);
        console.log('[ERROR]: ', error);
        handleHttpError(res, 'ERROR_GET_PERSONA')
    }
};

const createPersona = async (req, res) => {

    try {
        const customPathStorage = require("path").join(__dirname, "../storage/profiles");
        // Crear el middleware de Multer
        const upload = uploadMiddleware(1, customPathStorage).single("myfile");

        upload(req, res, async function (err) {
            // Verificar si hay errores de validación
            if (err) {
                return handleHttpError(res, "ERROR_SUBIDA_ARCHIVO: " + err.message, 400);
            }

            // Verificar si hay errores de validación personalizados
            if (req.fileValidationError) {
                console.log("ERROR_TIPO_ARCHIVO: " + req.fileValidationError);
                return handleHttpError(res, req.fileValidationError, 400);
            }

            try {
                // El archivo ya está subido (si existe)
                const file = req.file;

                // Obtener datos del formulario
                const {
                    nombre,
                    materno,
                    paterno,
                    correo,
                    ci,
                    celular,
                    sexo,
                    fecha_nacimiento
                } = req = matchedData(req)

                // Preparar datos para crear persona
                const personaData = {
                    nombre,
                    materno,
                    paterno,
                    correo,
                    ci,
                    celular,
                    sexo,
                    fecha_nacimiento
                };

                // Añadir foto solo si existe
                if (file) {
                    personaData.img = file.filename;
                }

                try {
                    const personaDb = await Persona.create(personaData);
                    handleResponseJson(res, 201, personaDb, 'PERSONA_CREADA')
                } catch (dbError) {
                    console.log("Error al crear persona:", dbError.message);
                    handleHttpError(res, "ERROR_CREAR_PERSONA", 500);
                }

            } catch (error) {
                console.log(error);
                handleHttpError(res, "ERROR_PROCESANDO_DATOS", 500);
            }

        });


    } catch (error) {
        console.log(error);
        handleHttpError(res, 'ERROR_CREATE_PERSONA', 500)
    }


};

const updatePersona = async (req, res) => {
    try {

        const customPathStorage = require("path").join(__dirname, "../storage/profiles");

        const { id } = req.params;

        // Buscar la persona antes de actualizar para verificar si tiene imagen
        const personaExistente = await Persona.findByPk(id);

        if (!personaExistente) {
            return handleHttpError(res, 'PERSONA_NO_ENCONTRADA', 404);
        }

        // Crear el middleware de Multer
        const upload = uploadMiddleware(id, customPathStorage).single("img");

        upload(req, res, async function (error) {
            // Verificar si hay errores de validación
            if (error) {
                return handleHttpError(res, "ERROR_SUBIDA_ARCHIVO: " + error.message, 400);
            }

            // Verificar si hay errores de validación personalizados
            if (req.fileValidationError) {
                return handleHttpError(res, req.fileValidationError, 400);
            }

            try {
                // El archivo ya está subido (si existe)
                const file = req.file;

                // Obtener datos del formulario
                const {
                    nombre,
                    paterno,
                    materno,
                    ci,
                    fecha_nacimiento,
                    correo_electronico,
                    sexo
                } = req = matchedData(req);

                // Preparar datos para actualizar persona
                const personaData = {
                    nombre,
                    paterno,
                    materno,
                    ci,
                    fecha_nacimiento,
                    correo_electronico,
                    sexo
                };

                // Manejar la imagen si existe una nueva
                if (file) {

                    // Si ya existe una imagen anterior, eliminarla
                    if (personaExistente.img) {
                        const imagenAnterior = require("path").join(customPathStorage, personaExistente.img);

                        const eliminado = deleteFile(imagenAnterior);

                        if (eliminado) {
                            console.log("Imagen anterior eliminada:", personaExistente.img);
                        } else {
                            console.log("No se encontró la imagen anterior:", personaExistente.img);
                        }
                    }

                    // Actualizar con la nueva imagen
                    personaData.img = file.filename;
                }

                // Actualizar la persona en la base de datos
                try {
                    await Persona.update(personaData, { where: { id_persona: id } });
                    const personaActualizada = await Persona.findByPk(id);
                    handleResponseJson(res, 200, personaActualizada, 'PERSONA_ACTUALIZADA');
                } catch (dbError) {
                    console.log("Error al actualizar persona:", dbError.message);
                    handleHttpError(res, "ERROR_ACTUALIZAR_PERSONA", 500);
                }

            } catch (error) {
                console.log(error);
                handleHttpError(res, "ERROR_PROCESANDO_DATOS", 500);
            }
        });



    } catch (error) {
        console.log(error);
        handleHttpError(res, 'ERROR_UPDATE_PERSONA', 500)
    }
};

const deletePersona = async (req, res) => {
    try {

        // obtener el parametro id de la url
        const { id } = req.params;

        // actualizar la persona en la base de datos
        await Persona.update({ activo: false }, { where: { id_persona: id } })

        handleResponseJsonMsg(res, 200, 'PERSONA_ELIMINADA');

    } catch (error) {
        // console.log(error);
        handleHttpError(res, 'ERROR_DELETE_PERSONA', 500);
    }
};

const retornarImagen = async (req, res) => {
    try {

        const foto = req.params.img;

        const pathImg = path.join(__dirname, `../storage/profiles/${foto}`);

        if (!fs.existsSync(pathImg)) {
            // const pathImg = path.join(__dirname, `../storage/profiles/no-img.jpg`);
            const pathImg = 'https://cdn-icons-png.flaticon.com/512/848/848006.png'
            // res.sendFile(pathImg);
            return res.redirect(pathImg);
        }

        return res.sendFile(pathImg);

    } catch (error) {
        console.log(error);
        handleHttpError(res, 'ERROR_CARGA_FOTO_PERFIL', 500);
    }
}

module.exports = { getPersona, getPersonas, createPersona, updatePersona, deletePersona, retornarImagen }