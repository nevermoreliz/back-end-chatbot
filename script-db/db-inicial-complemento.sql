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


-- =============================================================================
-- BLOQUE 2: CATÁLOGO DE CURSOS
-- =============================================================================

-- Tabla: CategoriasCursos
CREATE TABLE cursos.categorias_cursos (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(100),
    color_hex VARCHAR(7),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_nombre_categoria CHECK (TRIM(nombre_categoria) <> ''),
    CONSTRAINT chk_color_hex CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$' OR color_hex IS NULL),
    CONSTRAINT uq_nombre_categoria UNIQUE (nombre_categoria)
);
COMMENT ON TABLE cursos.categorias_cursos IS 'Categorías de cursos con elementos visuales para el chatbot.';

-- Tabla: Etiquetas
CREATE TABLE cursos.etiquetas (
    id_etiqueta SERIAL PRIMARY KEY,
    nombre_etiqueta VARCHAR(100) NOT NULL,
    descripcion TEXT,
    color_hex VARCHAR(7),
    icono VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_nombre_etiqueta CHECK (TRIM(nombre_etiqueta) <> ''),
    CONSTRAINT chk_color_hex_etiqueta CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$' OR color_hex IS NULL),
    CONSTRAINT uq_nombre_etiqueta UNIQUE (nombre_etiqueta)
);
COMMENT ON TABLE cursos.etiquetas IS 'Etiquetas para clasificar categorías de cursos.';

-- Tabla: CategoriasEtiquetas
CREATE TABLE cursos.categorias_etiquetas (
    id_categoria_etiqueta SERIAL PRIMARY KEY,
    id_categoria INT NOT NULL,
    id_etiqueta INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categoria_etiqueta FOREIGN KEY (id_categoria) REFERENCES cursos.categorias_cursos(id_categoria) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_etiqueta_categoria FOREIGN KEY (id_etiqueta) REFERENCES cursos.etiquetas(id_etiqueta) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_categoria_etiqueta UNIQUE (id_categoria, id_etiqueta)
);
COMMENT ON TABLE cursos.categorias_etiquetas IS 'Relación muchos a muchos entre categorías y etiquetas.';



-- Tabla: Cursos
CREATE TABLE cursos.cursos (
    id_curso SERIAL PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre_curso VARCHAR(200) NOT NULL,
    descripcion TEXT,
    descripcion_corta VARCHAR(500),
    dirigido_a TEXT,
    version VARCHAR(10) NOT NULL,
    anio INT NOT NULL,
    horario TEXT,
    duracion_semanas INT,
    carga_horaria INT,
    precio NUMERIC(10, 2) NOT NULL,
    precio_promocional NUMERIC(10,2),
    descuento NUMERIC(5, 2) DEFAULT 0.00,
    fecha_inicio_descuento TIMESTAMP WITH TIME ZONE,
    fecha_fin_descuento TIMESTAMP WITH TIME ZONE,
    precio_grupal NUMERIC(10,2),
    min_estudiantes_precio_grupal INT DEFAULT 5,
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_limite_inscripcion DATE,
    fecha_inicio_clases DATE,
    max_participantes INT,
    min_participantes INT DEFAULT 1,
    modalidad VARCHAR(20) DEFAULT 'Presencial' CHECK (modalidad IN ('Presencial', 'Virtual', 'Hibrido')),
    nivel VARCHAR(20) DEFAULT 'Intermedio' CHECK (nivel IN ('Basico', 'Intermedio', 'Avanzado')),
    idioma VARCHAR(5) DEFAULT 'es',
    certificado_incluido BOOLEAN DEFAULT TRUE,
    requisitos TEXT,
    beneficios TEXT,
    incluye TEXT,
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    url_afiche VARCHAR(255),
    url_contenidos_pdf VARCHAR(255),
    url_video_promocional VARCHAR(255),
    -- NUEVO v2: campos para divulgación y SEO
    palabras_clave TEXT,                    -- keywords para búsqueda interna del chatbot
    pregunta_frecuente JSONB,              -- [{"q":"...","a":"..."}] para el bot
    mensaje_bienvenida TEXT,               -- Mensaje que envía el bot al mostrar este curso
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categoria FOREIGN KEY (id_categoria) REFERENCES cursos.CategoriasCursos(id_categoria) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_version CHECK (TRIM(version) <> ''),
    CONSTRAINT chk_anio_positivo CHECK (anio >= 2000 AND anio <= EXTRACT(YEAR FROM CURRENT_DATE) + 5),
    CONSTRAINT chk_precio_positivo CHECK (precio >= 0),
    CONSTRAINT chk_descuento CHECK (descuento >= 0 AND descuento <= 100),
    CONSTRAINT chk_fechas CHECK (fecha_inicio <= fecha_fin OR fecha_fin IS NULL),
    CONSTRAINT chk_fecha_limite CHECK (fecha_limite_inscripcion <= fecha_inicio OR fecha_limite_inscripcion IS NULL),
    CONSTRAINT chk_participantes CHECK (min_participantes <= max_participantes OR max_participantes IS NULL),
    CONSTRAINT chk_url_afiche CHECK (TRIM(url_afiche) <> '' OR url_afiche IS NULL),
    CONSTRAINT chk_url_contenidos_pdf CHECK (TRIM(url_contenidos_pdf) <> '' OR url_contenidos_pdf IS NULL),
    CONSTRAINT uq_curso_version_anio UNIQUE (nombre_curso, version, anio)
);
COMMENT ON TABLE cursos.Cursos IS 'Cursos con campos extendidos para divulgación en chatbot (FAQs, palabras clave, mensaje de bienvenida).';


-- Tabla: CursosAgentes
-- CAMBIO v2: se elimina UNIQUE(id_curso) para permitir múltiples agentes por curso.
--            Se agrega rol_agente para diferenciar responsabilidades.
CREATE TABLE cursos.cursos_agentes (
    id_curso_agente SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_curso INT NOT NULL,
    rol_agente VARCHAR(30) DEFAULT 'Responsable' CHECK (rol_agente IN ('Responsable', 'Apoyo', 'Supervisor')),
    activo BOOLEAN DEFAULT TRUE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_agente FOREIGN KEY (id_usuario) REFERENCES cursos.Usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_curso_agente FOREIGN KEY (id_curso) REFERENCES cursos.Cursos(id_curso) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_curso_agente_usuario UNIQUE (id_curso, id_usuario)  -- <-- CORREGIDO: un usuario no puede estar dos veces en el mismo curso
);
COMMENT ON TABLE cursos.cursos_agentes IS 'Agentes asignados a cursos. Un curso puede tener varios agentes con distintos roles.';


-- =============================================================================
-- BLOQUE 3: MEDIOS DE COBRO
-- =============================================================================

-- Tabla: Bancos
CREATE TABLE cursos.bancos (
    id_banco SERIAL PRIMARY KEY,
    nombre_banco VARCHAR(100) NOT NULL,
    codigo_banco VARCHAR(10),
    logo_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_nombre_banco CHECK (TRIM(nombre_banco) <> ''),
    CONSTRAINT uq_nombre_banco UNIQUE (nombre_banco)
);
COMMENT ON TABLE cursos.bancos IS 'Catálogo de bancos disponibles en el sistema.';



-- Insertar roles por defecto
INSERT INTO cursos.Roles (nombre_rol, descripcion) VALUES 
('administrador', 'Acceso completo al sistema'),
('agente', 'Gestión de cursos y leads asignados'),
('usuario registrado', 'Usuario final del sistema');



