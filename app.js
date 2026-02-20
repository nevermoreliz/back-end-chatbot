require("dotenv").config()
const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const ServerBotApi = require('./apiBot')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const SequelizeAdapter = require('./providers/database')

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
