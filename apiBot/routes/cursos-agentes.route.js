const express = require('express')
const router = express.Router()

const { getCursosAgente, asignarCursoAgente } = require('../controllers/cursos-agentes.controller');
const { requireRole, ACCESS } = require('../middlewares/guard.middleware');
const { getCursoAgenteValidacion } = require('../validators/cursos-agentes.validator');

//TODO http://localhost/cursos-agentes :: get,post,delete.put

router.get("/:id_usuario", requireRole(ACCESS.STAFF), getCursosAgente);
router.post("/asignar", requireRole(ACCESS.STAFF), getCursoAgenteValidacion(false), asignarCursoAgente);


module.exports = router