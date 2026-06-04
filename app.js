require("dotenv").config()
const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const fs = require('fs')
const path = require('path')

const ServerBotApi = require('./apiBot')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const SequelizeAdapter = require('./providers/database')

/**
 * Limpia archivos de sesión de Baileys corruptos (vacíos o JSON inválido)
 * para evitar el error "Unexpected end of JSON input" al iniciar
 */
const cleanCorruptedSessionFiles = () => {
    const sessionDir = path.join(__dirname, 'bot_sessions')
    if (!fs.existsSync(sessionDir)) return

    const files = fs.readdirSync(sessionDir).filter(f => f.endsWith('.json'))
    let cleaned = 0

    for (const file of files) {
        const filePath = path.join(sessionDir, file)
        try {
            const content = fs.readFileSync(filePath, 'utf-8')
            if (!content || content.trim().length === 0) {
                fs.unlinkSync(filePath)
                console.log(`🧹 Archivo de sesión vacío eliminado: ${file}`)
                cleaned++
                continue
            }
            JSON.parse(content) // verificar que sea JSON válido
        } catch (err) {
            fs.unlinkSync(filePath)
            console.log(`🧹 Archivo de sesión corrupto eliminado: ${file}`)
            cleaned++
        }
    }

    if (cleaned > 0) {
        console.log(`🧹 Se limpiaron ${cleaned} archivo(s) de sesión corrupto(s)`)
    }
}


const flowPrincipal = require('./flows/welcom.flow')

/**
 * Declaramos las conexiones de PostgreSQL
 */

const POSTGRES_DB_HOST = process.env.POSTGRES_DB_HOST
const POSTGRES_DB_USER = process.env.POSTGRES_DB_USER
const POSTGRES_DB_PASSWORD = process.env.POSTGRES_DB_PASSWORD
const POSTGRES_DB_NAME = process.env.POSTGRES_DB_NAME
const POSTGRES_DB_PORT = process.env.POSTGRES_DB_PORT


const main = async () => {
    // Limpiar archivos de sesión corruptos antes de iniciar
    cleanCorruptedSessionFiles()

    const adapterDB = new SequelizeAdapter({
        host: POSTGRES_DB_HOST,
        user: POSTGRES_DB_USER,
        database: POSTGRES_DB_NAME,
        password: POSTGRES_DB_PASSWORD,
        port: POSTGRES_DB_PORT,
    })
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    const serverBotApi = new ServerBotApi(adapterProvider, adapterDB)
    serverBotApi.start()

}

main()
