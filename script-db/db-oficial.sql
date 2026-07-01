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
    CONSTRAINT fk_categoria FOREIGN KEY (id_categoria) REFERENCES cursos.categorias_cursos(id_categoria) ON DELETE RESTRICT ON UPDATE CASCADE,
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

-- Tabla: CuentasBancarias
CREATE TABLE cursos.cuentas_bancarias (
    id_cuenta SERIAL PRIMARY KEY,
    id_banco INT NOT NULL,
    id_usuario INT NOT NULL,
    numero_cuenta VARCHAR(50) NOT NULL,
    tipo_cuenta VARCHAR(20) NOT NULL CHECK (tipo_cuenta IN ('Ahorros', 'Corriente')),
    titular_cuenta VARCHAR(150) NOT NULL,
    ci_titular VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_banco_cuenta FOREIGN KEY (id_banco) REFERENCES cursos.Bancos(id_banco) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_usuario_cuenta FOREIGN KEY (id_usuario) REFERENCES cursos.Usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_numero_cuenta CHECK (TRIM(numero_cuenta) <> ''),
    CONSTRAINT chk_titular_cuenta CHECK (TRIM(titular_cuenta) <> ''),
    CONSTRAINT chk_ci_titular CHECK (TRIM(ci_titular) <> ''),
    CONSTRAINT uq_banco_cuenta UNIQUE (id_banco, numero_cuenta)
);
COMMENT ON TABLE cursos.cuentas_bancarias IS 'Cuentas bancarias para recibir transferencias y depósitos.';

-- Tabla: QRCobros
-- CAMBIO v2: se elimina CHECK dinámico sobre fecha_expiracion (CURRENT_DATE no es estable en CHECK).
--            La validez se controla desde el backend o con una vista.
CREATE TABLE cursos.qr_cobros (
    id_qr_cobro SERIAL PRIMARY KEY,
    id_banco INT NOT NULL,
    id_curso INT NOT NULL,
    id_usuario INT NOT NULL,
    codigo_qr VARCHAR(100) NOT NULL,
    url_imagen_qr VARCHAR(255) NOT NULL,
    monto_fijo NUMERIC(10,2),
    moneda VARCHAR(10) DEFAULT 'BOB' CHECK (moneda IN ('BOB', 'USD')),
    descripcion VARCHAR(200),
    fecha_expiracion DATE,                  -- <-- CHECK dinámico eliminado, se valida en backend
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_curso_qr FOREIGN KEY (id_curso) REFERENCES cursos.Cursos(id_curso) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_banco_qr FOREIGN KEY (id_banco) REFERENCES cursos.Bancos(id_banco) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_usuario_qr FOREIGN KEY (id_usuario) REFERENCES cursos.Usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_codigo_qr CHECK (TRIM(codigo_qr) <> ''),
    CONSTRAINT chk_url_imagen_qr CHECK (TRIM(url_imagen_qr) <> ''),
    CONSTRAINT chk_monto_fijo CHECK (monto_fijo IS NULL OR monto_fijo > 0),
    CONSTRAINT uq_curso_banco_qr UNIQUE (id_curso, id_banco, codigo_qr)
);
COMMENT ON TABLE cursos.qr_cobros IS 'Códigos QR por curso y banco. La expiración se valida en backend, no en CHECK.';

-- =============================================================================
-- BLOQUE 4: COMERCIAL Y FLUJO DE INSCRIPCIÓN
-- =============================================================================

-- Tabla: Leads
-- CAMBIO v2: UNIQUE corregido a (id_persona, id_curso)
CREATE TABLE cursos.Leads (
    id_lead SERIAL PRIMARY KEY,
    id_persona INT NOT NULL,
    id_curso INT NOT NULL,
    nivel_interes VARCHAR(20) NOT NULL DEFAULT 'Medio' CHECK (nivel_interes IN ('Bajo', 'Medio', 'Alto', 'Muy Alto')),
    fuente VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'Nuevo' CHECK (estado IN ('Nuevo', 'Contactado', 'Interesado', 'No Interesado', 'Inscrito', 'Perdido')),
    horario_contacto VARCHAR(100),
    comentarios TEXT,
    respuesta_automatica_enviada BOOLEAN DEFAULT FALSE,
    fecha_primer_contacto TIMESTAMP WITH TIME ZONE,
    fecha_ultimo_contacto TIMESTAMP WITH TIME ZONE,
    fecha_proxima_accion TIMESTAMP WITH TIME ZONE,
    id_agente_asignado INT,
    ultima_interaccion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_persona_lead FOREIGN KEY (id_persona) REFERENCES cursos.Personas(id_persona) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_curso_lead FOREIGN KEY (id_curso) REFERENCES cursos.Cursos(id_curso) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_agente_lead FOREIGN KEY (id_agente_asignado) REFERENCES cursos.Usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_fuente CHECK (TRIM(fuente) <> '' OR fuente IS NULL),
    CONSTRAINT uq_persona_curso_lead UNIQUE (id_persona, id_curso)  -- <-- CORREGIDO: era UNIQUE(id_curso)
);
COMMENT ON TABLE cursos.Leads IS 'Interés de personas en cursos. Un lead por persona-curso.';

-- Tabla: Inscripciones
CREATE TABLE cursos.inscripciones (
    id_inscripcion SERIAL PRIMARY KEY,
    id_persona INT NOT NULL,
    id_curso INT NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Confirmada', 'Cancelada', 'Completada')),
    metodo_inscripcion VARCHAR(20) DEFAULT 'Chatbot' CHECK (metodo_inscripcion IN ('Chatbot', 'Web', 'Presencial', 'Telefono')),
    metodo_pago_elegido VARCHAR(20) CHECK (metodo_pago_elegido IN ('Transferencia', 'Deposito', 'QR')),
    id_cuenta_bancaria INT,
    id_qr_cobro INT,
    observaciones TEXT,
    fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion TIMESTAMP WITH TIME ZONE,
    fecha_cancelacion TIMESTAMP WITH TIME ZONE,
    motivo_cancelacion TEXT,
    certificado_fisico_recogido BOOLEAN DEFAULT FALSE,
    fecha_recojo_certificado_fisico TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_persona_inscripcion FOREIGN KEY (id_persona) REFERENCES cursos.Personas(id_persona) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_curso_inscripcion FOREIGN KEY (id_curso) REFERENCES cursos.Cursos(id_curso) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cuenta_bancaria_inscripcion FOREIGN KEY (id_cuenta_bancaria) REFERENCES cursos.cuentas_bancarias(id_cuenta) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_qr_cobro_inscripcion FOREIGN KEY (id_qr_cobro) REFERENCES cursos.qr_cobros(id_qr_cobro) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_metodo_pago_consistencia CHECK (
        (metodo_pago_elegido IN ('Transferencia', 'Deposito') AND id_cuenta_bancaria IS NOT NULL AND id_qr_cobro IS NULL) OR
        (metodo_pago_elegido = 'QR' AND id_qr_cobro IS NOT NULL AND id_cuenta_bancaria IS NULL) OR
        (metodo_pago_elegido IS NULL AND id_cuenta_bancaria IS NULL AND id_qr_cobro IS NULL)
    )
);
COMMENT ON TABLE cursos.Inscripciones IS 'Inscripciones de personas a cursos con seguimiento del método de pago.';

-- Tabla: Pagos
CREATE TABLE cursos.Pagos (
    id_pago SERIAL PRIMARY KEY,
    id_inscripcion INT NOT NULL,
    codigo_referencia VARCHAR(100) UNIQUE,
    monto NUMERIC(10,2) NOT NULL,
    moneda VARCHAR(10) DEFAULT 'BOB',
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('Transferencia', 'Deposito', 'QR')),
    id_cuenta_bancaria INT,
    id_qr_cobro INT,
    estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Verificando', 'Confirmado', 'Rechazado', 'Devuelto')),
    comprobante_url VARCHAR(255),
    identificador_comprobante VARCHAR(100) NOT NULL,
    numero_transaccion VARCHAR(100),
    fecha_pago_reportada DATE,
    fecha_verificacion TIMESTAMP WITH TIME ZONE,
    verificado_por INT,
    observaciones_pago TEXT,
    datos_transaccion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inscripcion_pago FOREIGN KEY (id_inscripcion) REFERENCES cursos.inscripciones(id_inscripcion) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cuenta_bancaria_pago FOREIGN KEY (id_cuenta_bancaria) REFERENCES cursos.cuentas_bancarias(id_cuenta) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_qr_cobro_pago FOREIGN KEY (id_qr_cobro) REFERENCES cursos.qr_cobros(id_qr_cobro) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_verificado_por FOREIGN KEY (verificado_por) REFERENCES cursos.Usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_monto_positivo CHECK (monto > 0),
    CONSTRAINT chk_identificador_comprobante CHECK (TRIM(identificador_comprobante) <> ''),
    CONSTRAINT chk_metodo_pago_consistencia CHECK (
        (metodo_pago IN ('Transferencia', 'Deposito') AND id_cuenta_bancaria IS NOT NULL AND id_qr_cobro IS NULL) OR
        (metodo_pago = 'QR' AND id_qr_cobro IS NOT NULL AND id_cuenta_bancaria IS NULL)
    ),
    CONSTRAINT uq_identificador_comprobante UNIQUE (identificador_comprobante)
);
COMMENT ON TABLE cursos.Pagos IS 'Pagos con comprobante único. Estado verificado manualmente por agentes.';

-- =============================================================================
-- BLOQUE 5: CHATBOT (NUEVO en v2)
-- =============================================================================

-- Tabla: SesionesChatbot
-- Registra cada conversación iniciada, con estado del flujo y contexto JSON
CREATE TABLE cursos.sesiones_chatbot (
    id_sesion_chat SERIAL PRIMARY KEY,
    id_persona INT,                             -- NULL si aún no se identificó
    canal VARCHAR(20) NOT NULL CHECK (canal IN ('WhatsApp', 'Web', 'Telegram', 'Facebook')),
    numero_contacto VARCHAR(30),                -- Número de WhatsApp u otro identificador externo
    identificador_externo VARCHAR(100),         -- ID de conversación de la plataforma (ej: WA message ID)
    estado_flujo VARCHAR(50) DEFAULT 'inicio',  -- Estado actual del diálogo (inicio, viendo_cursos, inscribiendo, etc.)
    contexto_json JSONB DEFAULT '{}',           -- Variables del diálogo en curso
    id_curso_interes INT,                       -- Curso que está explorando en esta sesión
    sesion_activa BOOLEAN DEFAULT TRUE,
    ultimo_mensaje_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_persona_sesion_chat FOREIGN KEY (id_persona) REFERENCES cursos.personas(id_persona) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_curso_sesion_chat FOREIGN KEY (id_curso_interes) REFERENCES cursos.cursos(id_curso) ON DELETE SET NULL ON UPDATE CASCADE
);
COMMENT ON TABLE cursos.sesiones_chatbot IS 'Sesiones de conversación del chatbot. Permite retomar contexto entre mensajes.';


-- Insertar roles por defecto
INSERT INTO cursos.Roles (nombre_rol, descripcion) VALUES 
('administrador', 'Acceso completo al sistema'),
('agente', 'Gestión de cursos y leads asignados'),
('usuario registrado', 'Usuario final del sistema');

INSERT INTO cursos.Bancos (nombre_banco, codigo_banco) VALUES
('Banco Nacional de Bolivia', 'BNB'),
('Banco Mercantil Santa Cruz', 'BMSC'),
('Banco de Crédito de Bolivia', 'BCP'),
('Banco Ganadero', 'BGN'),
('Banco Económico', 'BEC'),
('Banco Fassil', 'FAS'),
('Banco Solidario', 'SOL'),
('Banco Union', 'BU');

INSERT INTO cursos.categorias_cursos (nombre_categoria, descripcion, icono, color_hex) VALUES
('MONOGRAFÍA',               'Elaboración, estructura y metodología de monografías académicas',  'document-text',  '#4F46E5'),
('TESIS',                    'Investigación, metodología y redacción de tesis de grado y postgrado', 'academic-cap', '#059669'),
('ENSAYOS',                  'Redacción y estructura de ensayos académicos',                     'pencil-square',  '#DC2626'),
('PROYECTOS DE INVESTIGACIÓN','Formulación, desarrollo y presentación de proyectos',             'beaker',         '#7C3AED'),
('ARTÍCULOS CIENTÍFICOS',    'Redacción y publicación en revistas científicas',                  'newspaper',      '#0891B2'),
('PROPUESTAS ACADÉMICAS',    'Elaboración de propuestas de investigación y proyectos académicos','light-bulb',     '#EA580C');

INSERT INTO cursos.Etiquetas (nombre_etiqueta, descripcion, color_hex) VALUES
('Tecnología y Sistemas', 'Profesionales del área tecnológica e informática',     '#0066CC'),
('Salud',                 'Profesionales del sector salud y medicina',             '#00AA44'),
('Educación',             'Profesionales de la enseñanza y formación',             '#4169E1'),
('Administración y Finanzas','Profesionales de gestión empresarial y financiera',  '#FFD700'),
('Derecho y Justicia',    'Profesionales del ámbito legal y jurídico',             '#8B0000'),
('Ingeniería',            'Profesionales de la ingeniería en todas sus ramas',     '#FF4500'),
('Comunicación',          'Profesionales de medios y comunicación',                '#FF1493'),
('Arte y Diseño',         'Profesionales creativos y artísticos',                  '#DA70D6'),
('Ciencias',              'Profesionales de investigación y ciencias',             '#228B22'),
('Construcción',          'Profesionales de la construcción y arquitectura',       '#8B4513'),
('Online',                'Cursos completamente virtuales',                        '#007BFF'),
('Presencial',            'Cursos que requieren asistencia física',                '#6C757D'),
('Híbrido',               'Cursos con modalidad mixta',                            '#17A2B8'),
('Básico',                'Cursos de nivel principiante',                          '#28A745'),
('Intermedio',            'Cursos de nivel intermedio',                            '#FFC107'),
('Avanzado',              'Cursos de nivel avanzado',                              '#DC3545'),
('Certificación',         'Cursos que otorgan certificaciones',                    '#FFC107'),
('Intensivo',             'Cursos de corta duración intensiva',                    '#DC3545'),
('Workshop',              'Talleres prácticos',                                    '#FD7E14');



