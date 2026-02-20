const express = require("express");
const fs = require("fs")
const router = express.Router();

const PATH_ROUTES = __dirname;

const removeExtension = (fileName) => {
    // Convert qr.route.js -> qr
    // Convert user.route.js -> user
    return fileName.split('.').shift()
}

fs.readdirSync(PATH_ROUTES).filter((file) => {
    const name = removeExtension(file)
    if (name !== 'index') {
        console.log(`=============`)
        console.log(`Cargando ruta ${name}`)
        console.log(`=============`)
        router.use(`/${name}`, require(`./${file}`))
    }
})

module.exports = router