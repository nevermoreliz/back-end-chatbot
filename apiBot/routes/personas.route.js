const express = require('express')
const router = express.Router()
const { getPersona, createPersona, updatePersona, retornarImagen, getPersonas, deletePersona } = require('../controllers/personas.controller')
const { validatorCreatePersona, validatorUpdatePersona } = require('../validators/personas.validator');
const authMiddleware = require('../middlewares/session.middleware');
const checkRol = require('../middlewares/rol.middleware');

router.get("/profile/:img", [authMiddleware, checkRol(['Administrador', 'Agente'])], retornarImagen);

router.get("/:id", [authMiddleware, checkRol(['Administrador'])], getPersona);
router.get("/", [authMiddleware, checkRol(['Administrador'])], getPersonas);
router.post("/", [authMiddleware, checkRol(['Administrador']), validatorCreatePersona], createPersona);
router.put("/:id", [authMiddleware, checkRol(['Administrador'])], validatorUpdatePersona, updatePersona);
router.delete("/:id", [authMiddleware, checkRol(['Administrador'])], deletePersona);


// enlaces para database
router.post("/datatable", authMiddleware, checkRol(['Administrador']), getPersonas);



module.exports = router