CREATE SCHEMA IF NOT EXISTS cursos;
SET search_path TO cursos, public;

-- Tabla: Personas
-- Descripción: Almacena datos personales de todas las personas (pueden o no tener acceso al sistema)
CREATE TABLE cursos.personas (
    id_persona SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    materno VARCHAR(100) NOT NULL,
    paterno VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    ci VARCHAR(50) NOT NULL,
    celular VARCHAR(20),
    img VARCHAR(255),
    sexo VARCHAR(10),
    fecha_nacimiento DATE, 
    notificaciones_chatbot BOOLEAN DEFAULT TRUE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_correo_persona CHECK (correo ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_nombre_persona CHECK (TRIM(nombre) <> ''),
    CONSTRAINT chk_paterno_persona CHECK (TRIM(paterno) <> ''),
    CONSTRAINT chk_materno_persona CHECK (TRIM(materno) <> ''),
    CONSTRAINT uq_correo_persona UNIQUE (correo),
    CONSTRAINT uq_ci_persona UNIQUE (ci)
);
COMMENT ON TABLE cursos.Personas IS 'Almacena datos personales de todas las personas, tengan o no acceso al sistema.';

-- Tabla: Roles
-- Descripción: Almacena los roles disponibles (Administrador, Agente, UsuarioRegistrado) para gestión de permisos en el backend.
CREATE TABLE cursos.roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL CHECK (nombre_rol IN ('administrador', 'agente', 'usuario registrado')),
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_nombre_rol CHECK (TRIM(nombre_rol) <> ''),
    CONSTRAINT uq_nombre_rol UNIQUE (nombre_rol)
);
COMMENT ON TABLE cursos.Roles IS 'Almacena los roles del sistema para gestión desde el backend.';


-- Tabla: Usuarios (REDISEÑADA)
-- Descripción: Almacena credenciales y datos de autenticación para acceso al sistema
CREATE TABLE cursos.usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_persona INT NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL,
    contrasenia_hash VARCHAR(255) NOT NULL,   
    -- Estados del usuario
    activo BOOLEAN DEFAULT TRUE,
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_persona_usuario FOREIGN KEY (id_persona) REFERENCES cursos.Personas(id_persona) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_username CHECK (TRIM(nombre_usuario) <> '' AND LENGTH(nombre_usuario) >= 3),    
    CONSTRAINT chk_password_hash CHECK (TRIM(contrasenia_hash) <> ''),
    CONSTRAINT uq_username UNIQUE (nombre_usuario),    
    CONSTRAINT uq_persona_usuario UNIQUE (id_persona) -- Una persona = un usuario del sistema
);
COMMENT ON TABLE cursos.Usuarios IS 'Almacena credenciales y configuraciones de autenticación para acceso al sistema.';

-- Tabla: usuarios_roles
-- Descripción: Asocia usuarios con roles para determinar permisos en el backend.
CREATE TABLE cursos.usuarios_roles (
    id_usuario INT NOT NULL,
    id_rol INT NOT NULL,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_usuario) REFERENCES cursos.Usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rol FOREIGN KEY (id_rol) REFERENCES cursos.Roles(id_rol) ON DELETE RESTRICT ON UPDATE CASCADE    
);
COMMENT ON TABLE cursos.usuarios_roles IS 'Asocia usuarios con roles para control de permisos.';


-- Insertar roles por defecto
INSERT INTO cursos.Roles (nombre_rol, descripcion) VALUES 
('administrador', 'Acceso completo al sistema'),
('agente', 'Gestión de cursos y leads asignados'),
('usuario registrado', 'Usuario final del sistema');



