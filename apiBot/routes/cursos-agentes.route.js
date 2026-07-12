const express = require('express')
const router = express.Router()

const { getCursosAgente } = require('../controllers/cursos-agentes.controller');
const { requireRole, ACCESS } = require('../middlewares/guard.middleware');

//TODO http://localhost/cursos-agentes :: get,post,delete.put

router.get("/:id_usuario", requireRole(ACCESS.STAFF), getCursosAgente);


module.exports = router