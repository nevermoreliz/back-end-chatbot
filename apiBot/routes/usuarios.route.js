const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/session.middleware')
const { validatorUsuario, validatorUpdateUsuario } = require('../validators/usuarios.validator')
const { getUsuario, createUsuario, updateUsuario, getUsuarios, deleteUsuario } = require('../controllers/usuarios.controller');
const checkRol = require('../middlewares/rol.middleware');

//TODO http://localhost/usuarios :: get,post,delete.put

router.get("/:id", [authMiddleware, checkRol(['Administrador'])], getUsuario);
router.get("/", [authMiddleware, checkRol(['Administrador'])], getUsuarios);
router.post("/", [authMiddleware, checkRol(['Administrador']), validatorUsuario], createUsuario);
router.put("/:id", [authMiddleware, checkRol(['Administrador']), validatorUpdateUsuario], updateUsuario);
router.delete("/:id", [authMiddleware, checkRol(['Administrador'])], deleteUsuario);

module.exports = router