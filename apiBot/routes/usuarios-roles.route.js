const express = require('express')
const router = express.Router()

const { validatorUsuarioRoles } = require('../validators/usuarios-roles.validator');
const { asignarRol, actualizarRol } = require('../controllers/usuarios-roles.controller');
const { requireRole, ACCESS } = require('../middlewares/guard.middleware');

//TODO http://localhost/usuarios-roles :: get,post,delete.put

router.post("/asignar", requireRole(ACCESS.ADMIN_ONLY), validatorUsuarioRoles, asignarRol);
router.put("/actualizar", requireRole(ACCESS.ADMIN_ONLY), validatorUsuarioRoles, actualizarRol);

module.exports = router