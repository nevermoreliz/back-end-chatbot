require('dotenv').config();
const { encrypt } = require('./apiBot/utils/handle-password');
const Persona = require('./apiBot/models/persona.model');
const Usuario = require('./apiBot/models/usuario.model');
const Rol = require('./apiBot/models/rol.model');
const UsuarioRol = require('./apiBot/models/usuarios-roles.model');
const sequelize = require('./apiBot/provider/database');

const setup = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida correctamente.');

        // Sincronizar modelos (crea las tablas si no existen)
        // force: false asegura que no eliminemos datos existentes a menos que falten las tablas
        await sequelize.sync({ force: false });
        console.log('✅ Modelos sincronizados.');

        // 1. Crear Persona
        // Verificamos si ya existe una persona administradora para evitar duplicados en caso de reejecución, o simplemente creamos una nueva.
        // Por simplicidad, crearemos una específica.
        const personaData = {
            nombre: 'Administrador',
            materno: 'Sistema',
            paterno: 'Principal',
            correo: 'admin@tuapp.com', // Asegúrate de que esto coincida con la lógica del usuario
            ci: '000000',
            celular: '00000000',
            sexo: 'M',
            fecha_nacimiento: '2000-01-01',
            notificaciones_chatbot: false,
            activo: true
        };

        const [persona, createdPersona] = await Persona.findOrCreate({
            where: { correo: personaData.correo },
            defaults: personaData
        });

        if (createdPersona) {
            console.log('👤 Persona administrador creada.');
        } else {
            console.log('ℹ️ Persona administrador ya existía.');
        }

        // 2. Crear Usuario
        const tempPassword = 'adminPassword12'; // O generar aleatorio
        const hashPassword = await encrypt(tempPassword);

        const usuarioData = {
            id_persona: persona.id_persona,
            nombre_usuario: 'admin',
            contrasenia_hash: hashPassword,
            activo: true
        };

        const [usuario, createdUsuario] = await Usuario.findOrCreate({
            where: { nombre_usuario: usuarioData.nombre_usuario },
            defaults: usuarioData
        });

        if (createdUsuario) {
            console.log('👤 Usuario administrador creado.');
        } else {
            // Si el usuario existe, ¿actualizamos la contraseña? O simplemente registramos
            console.log('ℹ️ Usuario administrador ya existía. No se cambió la contraseña.');
        }

        // 3. Asignar Rol (ID 1 = administrador)
        // Asegúrate de que el rol 1 exista o recupéralo por nombre
        const rolAdmin = await Rol.findOne({ where: { nombre_rol: 'administrador' } }); // Assuming DB initialized with roles
        let roleId = 1;
        if (rolAdmin) {
            roleId = rolAdmin.id_rol;
        } else {
            // Crear si no existe (fallback)
            const newRol = await Rol.create({ nombre_rol: 'administrador', descripcion: 'Administrador del sistema' });
            roleId = newRol.id_rol;
        }

        const [usuarioRol, createdUR] = await UsuarioRol.findOrCreate({
            where: { id_usuario: usuario.id_usuario, id_rol: roleId },
            defaults: {
                id_usuario: usuario.id_usuario,
                id_rol: roleId,
                fecha_asignacion: new Date().toISOString()
            }
        });

        if (createdUR) console.log('se le asigno el rol de administrador');

        console.log('----------------------------------------------------');
        console.log('✅ Admin creado exitosamente');
        console.log(`📧 Usuario: ${usuario.nombre_usuario}`);
        console.log(`🔑 Contraseña temporal: ${tempPassword}`);
        console.log('⚠️  Cambia esta contraseña inmediatamente después del primer login.');
        console.log('----------------------------------------------------');

    } catch (error) {
        console.error('❌ Error en el setup:', error);
    } finally {
        await sequelize.close();
    }
};

setup();
