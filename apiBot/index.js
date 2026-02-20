const express = require('express')
const cors = require('cors')
const { join } = require('path')

class ServerBotApi {
    constructor(provider, database, port = 3001) {
        this.provider = provider
        this.database = database
        this.port = port || process.env.PORT || 3001
        this.app = express()

        this.configure()
        this.registerRoutes()
    }

    configure() {
        this.app.use(cors())
        this.app.use(express.json())

        // Middleware para inyectar provider y db
        this.app.use((req, res, next) => {
            req.provider = this.provider
            req.db = this.database
            next()
        })

        // Archivos estáticos (perfiles)
        // Mapea /api/profile a apiBot/storage/profiles
        this.app.use("/api/profile", express.static(join(__dirname, "storage/profiles")))
    }

    registerRoutes() {
        // Cargar rutas dinámicas desde ./routes
        this.app.use("/api", require("./routes"))
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🚀 Servidor listo en http://localhost:${this.port}`)
            console.log(`📌 API disponible en http://localhost:${this.port}/api`)
            console.log(`📌 Código QR en http://localhost:${this.port}/api/qr`)
        })
    }
}

module.exports = ServerBotApi
