const { DataTypes } = require('sequelize');
const adapterDB = require('../provider/database');

const Curso = adapterDB.define('cursos',
    {

        id_curso: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_categoria: {
            type: DataTypes.INTEGER
        },
        nombre_curso: {
            type: DataTypes.STRING
        },
        descripcion: {
            type: DataTypes.TEXT
        },
        descripcion_corta: {
            type: DataTypes.STRING
        },
        dirigido_a: {
            type: DataTypes.TEXT
        },
        version: {
            type: DataTypes.INTEGER
        },
        anio: {
            type: DataTypes.INTEGER
        },
        horario: {
            type: DataTypes.INTEGER
        },
        duracion_semanas: {
            type: DataTypes.INTEGER
        },
        carga_horaria: {
            type: DataTypes.INTEGER
        },
        precio: {
            type: DataTypes.DECIMAL(10, 2)
        },
        precio_promocional: {
            type: DataTypes.DECIMAL(10, 2)
        },
        descuento: {
            type: DataTypes.DECIMAL(5, 2)
        },
        fecha_inicio_descuento: {
            type: DataTypes.STRING
        },
        fecha_fin_descuento: {
            type: DataTypes.STRING
        },
        precio_grupal: {
            type: DataTypes.DECIMAL(10, 2)
        },
        min_estudiantes_precio_grupal: {
            type: DataTypes.INTEGER
        },
        fecha_inicio: {
            type: DataTypes.STRING
        },
        fecha_fin: {
            type: DataTypes.STRING
        },
        fecha_limite_inscripcion: {
            type: DataTypes.STRING
        },
        fecha_inicio_clases: {
            type: DataTypes.STRING
        },
        max_participantes: {
            type: DataTypes.INTEGER
        },
        min_participantes: {
            type: DataTypes.INTEGER
        },
        modalidad: {
            type: DataTypes.STRING
        },
        nivel: {
            type: DataTypes.STRING
        },
        idioma: {
            type: DataTypes.STRING
        },
        certificado_incluido: {
            type: DataTypes.BOOLEAN
        },
        requisitos: {
            type: DataTypes.TEXT
        },
        beneficios: {
            type: DataTypes.TEXT
        },
        incluye: {
            type: DataTypes.TEXT
        },
        activo: {
            type: DataTypes.BOOLEAN
        },
        destacado: {
            type: DataTypes.BOOLEAN
        },
        url_afiche: {
            type: DataTypes.STRING
        },
        url_contenidos_pdf: {
            type: DataTypes.STRING
        },
        url_video_promocional: {
            type: DataTypes.STRING
        },
        palabras_clave: {
            type: DataTypes.STRING
        },
        pregunta_frecuente: {
            type: DataTypes.JSONB
        },
        mensaje_bienvenida: {
            type: DataTypes.TEXT
        },
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        schema: 'cursos'
    });

module.exports = Curso