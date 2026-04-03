const express = require('express')
const router = express.Router()

const checkRol = require('../middlewares/rol.middleware');
const authMiddleware = require('../middlewares/session.middleware')
const { validatorUsuarioRoles } = require('../validators/usuarios-roles.validator');
const { asignarRol, actualizarRol } = require('../controllers/usuarios-roles.controller');

//TODO http://localhost/usuarios-roles :: get,post,delete.put

router.post("/asignar", [authMiddleware, checkRol(['administrador']), validatorUsuarioRoles], asignarRol);
router.put("/actualizar", [authMiddleware, checkRol(['administrador']), validatorUsuarioRoles], actualizarRol);

module.exports = router