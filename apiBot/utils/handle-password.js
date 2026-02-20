const bcryptjs = require('bcryptjs')

/**
 * contraseña sin encriptar
 * @param {*} contraseniaPlano 
 */
const encrypt = async (contraseniaPlano) => {
    const salt = bcryptjs.genSaltSync();
    // const hash = await bcryptjs.hash(contraseniaPlano, 10)
    const hash = await bcryptjs.hashSync(contraseniaPlano, salt)
    return hash
}

/**
 * Pasar contrasenia sin encriptar y pásar contraseña encriptada
 * @param {*} contraseniaPlano 
 * @param {*} hashContrasenia 
 */
const compare = async (contraseniaPlano, hashContrasenia) => {
    // return await bcryptjs.compare(contraseniaPlano, hashContrasenia)
    return await bcryptjs.compare(contraseniaPlano, hashContrasenia)
}

module.exports = { encrypt, compare }