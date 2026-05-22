const express = require('express')
const router = express.Router()
const { validatorUsuario, validatorUpdateUsuario } = require('../validators/usuarios.validator')
const { getUsuario, createUsuario, updateUsuario, getUsuarios, deleteUsuario, habilitarUsuario } = require('../controllers/usuarios.controller');
const { requireRole, ACCESS } = require('../middlewares/guard.middleware');

//TODO http://localhost/api/usuarios :: get,post,delete.put

router.get("/:id", requireRole(ACCESS.ADMIN_ONLY), getUsuario);
router.get("/", requireRole(ACCESS.ADMIN_ONLY), getUsuarios);
router.post("/", requireRole(ACCESS.ADMIN_ONLY), validatorUsuario, createUsuario);
router.put("/:id", requireRole(ACCESS.ADMIN_ONLY), validatorUpdateUsuario, updateUsuario);

// desabilita logicamente
router.delete("/:id", requireRole(ACCESS.ADMIN_ONLY), deleteUsuario);
// habilita logicamente
router.put("/:id/habilitar", requireRole(ACCESS.ADMIN_ONLY), habilitarUsuario);

module.exports = router