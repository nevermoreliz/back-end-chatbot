const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/session.middleware')
const { validatorUsuario, validatorUpdateUsuario } = require('../validators/usuarios.validator')
const { getUsuario, createUsuario, updateUsuario, getUsuarios, deleteUsuario, habilitarUsuario } = require('../controllers/usuarios.controller');
const checkRol = require('../middlewares/rol.middleware');

//TODO http://localhost/api/usuarios :: get,post,delete.put

router.get("/:id", [authMiddleware, checkRol(['administrador'])], getUsuario);
router.get("/", [authMiddleware, checkRol(['administrador'])], getUsuarios);
router.post("/", [authMiddleware, checkRol(['administrador']), validatorUsuario], createUsuario);
router.put("/:id", [authMiddleware, checkRol(['administrador']), validatorUpdateUsuario], updateUsuario);

// desabilita logicamente
router.delete("/:id", [authMiddleware, checkRol(['administrador'])], deleteUsuario);
// habilita logicamente
router.put("/:id/habilitar", [authMiddleware, checkRol(['administrador'])], habilitarUsuario);

module.exports = router