const express = require('express')
const router = express.Router()

const { validatorRegistro, validatorLogin } = require('../validators/auth.validator');
const { loginCtrl, registroCtrl, renewToken } = require('../controllers/auth.controller');

const authMiddleware = require('../middlewares/session.middleware');

router.post("/registro", validatorRegistro, registroCtrl);
router.post("/login", validatorLogin, loginCtrl);
router.get('/renew', authMiddleware, renewToken)


module.exports = router