const express = require('express')
const router = express.Router()
const { uploadFile } = require('../controllers/storage.controller');
const { requireRole, ACCESS } = require('../middlewares/guard.middleware');
const { dynamicUploadMiddleware } = require('../utils/handle-storage');

//TODO http://localhost/api/modulo :: get,post,delete.put

// Subir archivo a storage/{modulo}/
router.post("/:modulo", requireRole(ACCESS.ALL_USERS), dynamicUploadMiddleware(), uploadFile);

// Subir archivo a storage/{modulo}/{id}/
router.post("/:modulo/:id", requireRole(ACCESS.ALL_USERS), dynamicUploadMiddleware(), uploadFile);

module.exports = router