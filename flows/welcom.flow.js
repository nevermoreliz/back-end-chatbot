const { addKeyword } = require("@bot-whatsapp/bot");

module.exports = addKeyword("hola")
    .addAnswer(
        ['Buenos días/tardes, bienvenido(a) a EduBot, el asistente avanzado con inteligencia artificial de Posgrado UPEA.',
            'Mi propósito es ofrecerle información precisa y personalizada sobre nuestros programas académicos: Diplomados, Especialidades, Maestrías, Doctorados y Postdoctorados.']
    )