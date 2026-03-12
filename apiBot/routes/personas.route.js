const express = require('express')
const router = express.Router()
const { getPersona, createPersona, updatePersona, retornarImagen, getPersonas, deletePersona } = require('../controllers/personas.controller')
const { validatorCreatePersona, validatorUpdatePersona } = require('../validators/personas.validator');
const authMiddleware = require('../middlewares/session.middleware');
const checkRol = require('../middlewares/rol.middleware');

router.get("/profile/:img", [authMiddleware, checkRol(['administrador', 'agente'])], retornarImagen);

router.get("/:id", [authMiddleware, checkRol(['administrador'])], getPersona);
router.get("/", [authMiddleware, checkRol(['administrador'])], getPersonas);
router.post("/", [authMiddleware, checkRol(['administrador']), validatorCreatePersona], createPersona);
router.put("/:id", [authMiddleware, checkRol(['administrador'])], validatorUpdatePersona, updatePersona);
router.delete("/:id", [authMiddleware, checkRol(['administrador'])], deletePersona);


// enlaces para database
router.post("/datatable", authMiddleware, checkRol(['administrador']), getPersonas);



module.exports = router