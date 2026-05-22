const express = require('express')
const router = express.Router()
const { getPersona, createPersona, updatePersona, retornarImagen, getPersonas, deletePersona, getPersonasUsuarios } = require('../controllers/personas.controller')
const { validatorCreatePersona, validatorUpdatePersona } = require('../validators/personas.validator');
const { requireRole, ACCESS } = require('../middlewares/guard.middleware');

router.get("/profile/:img", requireRole(ACCESS.STAFF), retornarImagen);

router.get("/usuarios", requireRole(ACCESS.ADMIN_ONLY), getPersonasUsuarios);

router.get("/:id", requireRole(ACCESS.STAFF), getPersona);
router.get("/", requireRole(ACCESS.ADMIN_ONLY), getPersonas);

router.post("/", requireRole(ACCESS.ADMIN_ONLY), validatorCreatePersona, createPersona);
router.put("/:id", requireRole(ACCESS.ADMIN_ONLY), validatorUpdatePersona, updatePersona);
router.delete("/:id", requireRole(ACCESS.ADMIN_ONLY), deletePersona);

module.exports = router