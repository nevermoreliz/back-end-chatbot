const express = require('express')
const router = express.Router()
const { createCurso, updateCurso, deleteCurso, getCurso, getCursos, buscarCurso } = require('../controllers/cursos.controller')
const { requireRole, ACCESS } = require('../middlewares/guard.middleware');
const { getCursoValidacion } = require('../validators/cursos.validator');

//TODO http://localhost/cursos :: get,post,delete.put

router.get("/", requireRole(ACCESS.STAFF), getCursos);
router.post("/", requireRole(ACCESS.STAFF), getCursoValidacion(false), createCurso);
router.get("/buscar", requireRole(ACCESS.STAFF), buscarCurso);
router.put("/:id", requireRole(ACCESS.STAFF), getCursoValidacion(true), updateCurso);
router.delete("/:id", requireRole(ACCESS.STAFF), deleteCurso);
router.get("/:id", requireRole(ACCESS.STAFF), getCurso);

module.exports = router