const express = require('express')
const router = express.Router()
const { getPersona, createPersona, updatePersona, retornarImagen, getPersonas, deletePersona, getPersonasUsuarios } = require('../controllers/personas.controller')
const { validatorCreatePersona, validatorUpdatePersona } = require('../validators/personas.validator');
const authMiddleware = require('../middlewares/session.middleware');
const checkRol = require('../middlewares/rol.middleware');

router.get("/profile/:img", [authMiddleware, checkRol(['administrador', 'agente'])], retornarImagen);


router.get("/usuarios", [authMiddleware, checkRol(['administrador'])], getPersonasUsuarios);

router.get("/:id", [authMiddleware, checkRol(['administrador', 'agente'])], getPersona);
router.get("/", [authMiddleware, checkRol(['administrador'])], getPersonas);

router.post("/", [authMiddleware, checkRol(['administrador']), validatorCreatePersona], createPersona);
router.put("/:id", [authMiddleware, checkRol(['administrador'])], validatorUpdatePersona, updatePersona);
router.delete("/:id", [authMiddleware, checkRol(['administrador'])], deletePersona);

module.exports = router