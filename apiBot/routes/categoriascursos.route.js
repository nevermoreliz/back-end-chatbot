const express = require('express')
const router = express.Router()
const { getCategoriasAll } = require('../controllers/categoriascursos.controller');
const { requireRole, ACCESS } = require('../middlewares/guard.middleware');

//TODO http://localhost/categoriascurso :: get

router.get("/", requireRole(ACCESS.STAFF), getCategoriasAll);


module.exports = router