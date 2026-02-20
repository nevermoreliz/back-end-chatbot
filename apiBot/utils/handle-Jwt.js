const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET
/**
 * Debe pasar el id de usuario para generar JWT
 * @param {*} usuario
 */
const tokenSing = async (id_usuario) => {

    const payload = { id: id_usuario }

    const sing = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: "2h" }
    );

    return sing
}

/**
 * Pasar el token de sesion el JWT
 * @param {*} tokenJwt
 */
const verifyToken = async (tokenJwt) => {

    try {
        return jwt.verify(tokenJwt, JWT_SECRET)
    } catch (error) {
        return null
    }
}

module.exports = { tokenSing, verifyToken }