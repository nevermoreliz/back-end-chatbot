const { handleHttpError } = require('../utils/handle-error');
const { matchedData } = require('express-validator');

const { handleResponseJsonMsg, handleResponseJson } = require('../utils/handle-response-json');

const { uploadMiddleware, deleteFile } = require("../utils/handle-storage");
const path = require('path');
const fs = require("fs");
const { Op } = require('sequelize');



const PUBLIC_URL = process.env.PUBLIC_URL;

const uploadFile = async (req, res) => {

    try {
        const { file } = req;

        // Obtenemos y limpiamos el nombre del módulo igual que en Multer
        let folder = req.params.modulo || 'general';
        folder = folder.replace(/[^a-zA-Z0-9_-]/g, '');

        // Obtenemos y limpiamos el id (opcional)
        let id = req.params.id || null;
        if (id) {
            id = id.replace(/[^a-zA-Z0-9_-]/g, '');
        }

        if (!file) {
            return res.status(400).json({ error: "No se adjuntó ningún archivo" });
        }

        // Construimos la URL pública dinámica
        // Resultado ej: http://localhost:3000/storage/cursos/file-1698...jpg
        // Resultado ej: http://localhost:3000/storage/cursos/42/file-42-1698...jpg
        const publicUrl = id
            ? `${process.env.PUBLIC_URL}/storage/${folder}/${id}/${file.filename}`
            : `${process.env.PUBLIC_URL}/storage/${folder}/${file.filename}`;

        res.status(201).json({
            message: "Archivo subido con éxito",
            url: publicUrl,
            filename: file.filename
        });

    } catch (error) {
        console.error("Error subiendo archivo:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }

};

module.exports = { uploadFile }