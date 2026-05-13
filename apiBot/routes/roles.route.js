const express = require('express')
const router = express.Router()

const checkRol = require('../middlewares/rol.middleware');
const authMiddleware = require('../middlewares/session.middleware')
const { getRoles } = require('../controllers/roles.controller');

//TODO http://localhost/roles :: get,post,delete.put

router.get("/", [authMiddleware, checkRol(['administrador'])], getRoles);

module.exports = router