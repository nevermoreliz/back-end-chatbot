const express = require('express')
const router = express.Router()

const { getRoles, createRol } = require('../controllers/roles.controller');
const { requireRole, ACCESS } = require('../middlewares/guard.middleware');
const { validatorCreateRol } = require('../validators/roles.validator');

//TODO http://localhost/roles :: get,post,delete.put

router.get("/", requireRole(ACCESS.ADMIN_ONLY), getRoles);

module.exports = router