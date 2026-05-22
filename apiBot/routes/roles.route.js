const express = require('express')
const router = express.Router()

const { getRoles } = require('../controllers/roles.controller');
const { requireRole, ACCESS } = require('../middlewares/guard.middleware');

//TODO http://localhost/roles :: get,post,delete.put

router.get("/", requireRole(ACCESS.ADMIN_ONLY), getRoles);

module.exports = router