const { join } = require("path");
const fs = require('fs');
const { handleResponseJson, handleResponseJsonMsg } = require('../utils/handle-response-json');

/**
 * Helper para verificar si el bot está conectado y activo en Baileys
 */
const checkConnectionState = (provider) => {
    try {
        const client = provider?.getInstance?.() || provider?.vendor;
        if (!client) return { connected: false };

        // Verificar si la conexión WS está abierta
        const isOpen = client.ws?.isOpen || (client.ws?.readyState === 1);
        const hasUser = !!client.user?.id;
        const phone = client.user?.id ? client.user.id.split(':')[0] : null;
        const name = client.user?.name || null;

        return {
            connected: !!(isOpen && hasUser),
            phone,
            name
        };
    } catch (error) {
        console.error("Error al verificar estado de conexión:", error);
        return { connected: false };
    }
};

const ctrlQR = async (req, res) => {
    const { provider } = req;
    const connState = checkConnectionState(provider);

    // Permitir opcionalmente obtener la imagen en bruto si el front lo solicita expresamente
    const wantRaw = req.query.raw === 'true';

    if (connState.connected) {
        if (wantRaw) {
            // Si piden la imagen pero ya está conectado, mandamos un status 204 o un mensaje indicativo
            return res.status(200).send("El bot ya está sincronizado. No hay código QR para mostrar.");
        }
        return handleResponseJson(res, 200, {
            status: "connected",
            connected: true,
            phone: connState.phone,
            name: connState.name
        }, "El bot ya está sincronizado con WhatsApp.");
    }

    // Si no está conectado, obtenemos el código QR
    const PATH_QR = join(process.cwd(), `bot.qr.png`);

    if (!fs.existsSync(PATH_QR)) {
        return handleResponseJson(res, 200, {
            status: "initializing",
            connected: false,
            qr: null
        }, "El bot se está iniciando o generando el código QR. Por favor espere...");
    }

    try {
        if (wantRaw) {
            res.writeHead(200, { "Content-Type": "image/png" });
            const fileStream = fs.createReadStream(PATH_QR);
            return fileStream.pipe(res);
        }

        // Leer archivo y convertir a Base64
        const qrBuffer = fs.readFileSync(PATH_QR);
        const qrBase64 = `data:image/png;base64,${qrBuffer.toString('base64')}`;

        return handleResponseJson(res, 200, {
            status: "qrcode",
            connected: false,
            qr: qrBase64
        }, "El bot no está sincronizado. Escanee el código QR para vincular su cuenta.");
    } catch (error) {
        console.error("Error al procesar el archivo QR:", error);
        return handleResponseJsonMsg(res, 500, "Error interno al procesar el código QR.");
    }
};

module.exports = { ctrlQR };


