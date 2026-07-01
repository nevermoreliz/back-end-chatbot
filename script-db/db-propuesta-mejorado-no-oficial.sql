-- =============================================================================
-- SCHEMA: cursos v2
-- Descripción: Schema corregido, optimizado y extendido para chatbot de
--              divulgación y gestión de cursos.
-- Cambios principales:
--   1. Corrección UNIQUE en Leads y CursosAgentes
--   2. Eliminación de CHECK dinámico en QRCobros
--   3. Trigger universal updated_at
--   4. Índices para consultas del chatbot
--   5. Nuevas tablas: SesionesChatbot, MensajesChatbot, Notificaciones,
--      PlantillasMensaje, CampañasMarketing
--   6. Campo numero_whatsapp en Personas
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS cursos;
SET search_path TO cursos, public;

-- -----------------------------------------------------------------------------
-- FUNCIÓN GLOBAL: actualizar updated_at automáticamente en cada UPDATE
-- Aplicada mediante triggers en todas las tablas
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION cursos.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- BLOQUE 1: IDENTIDAD Y ACCESO
-- =============================================================================

-- Tabla: Roles
CREATE TABLE cursos.Roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL CHECK (nombre_rol IN ('Administrador', 'Agente', 'UsuarioRegistrado')),
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_nombre_rol CHECK (TRIM(nombre_rol) <> ''),
    CONSTRAINT uq_nombre_rol UNIQUE (nombre_rol)
);
COMMENT ON TABLE cursos.Roles IS 'Almacena los roles del sistema para gestión desde el backend.';

CREATE TRIGGER trg_roles_updated_at
  BEFORE UPDATE ON cursos.Roles
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


-- Tabla: Personas
-- CAMBIO v2: se agrega numero_whatsapp separado de celular
CREATE TABLE cursos.Personas (
    id_persona SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    materno VARCHAR(100) NOT NULL,
    paterno VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    ci VARCHAR(50) NOT NULL,
    celular VARCHAR(20),
    numero_whatsapp VARCHAR(20),            -- <-- NUEVO: canal principal del chatbot
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
COMMENT ON TABLE cursos.Personas IS 'Datos personales de todas las personas. numero_whatsapp es el canal principal del chatbot.';

CREATE TRIGGER trg_personas_updated_at
  BEFORE UPDATE ON cursos.Personas
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


-- Tabla: Usuarios
CREATE TABLE cursos.Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_persona INT NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL,
    contrasenia_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_persona_usuario FOREIGN KEY (id_persona) REFERENCES cursos.Personas(id_persona) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_username CHECK (TRIM(nombre_usuario) <> '' AND LENGTH(nombre_usuario) >= 3),
    CONSTRAINT chk_password_hash CHECK (TRIM(contrasenia_hash) <> ''),
    CONSTRAINT uq_username UNIQUE (nombre_usuario),
    CONSTRAINT uq_persona_usuario UNIQUE (id_persona)
);
COMMENT ON TABLE cursos.Usuarios IS 'Credenciales de autenticación. Una persona = un usuario del sistema.';

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON cursos.Usuarios
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


-- Tabla: usuarios_roles
CREATE TABLE cursos.usuarios_roles (
    id_usuario INT NOT NULL,
    id_rol INT NOT NULL,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_usuario_rol PRIMARY KEY (id_usuario, id_rol),   -- <-- NUEVO: PK compuesta, evita duplicados
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_usuario) REFERENCES cursos.Usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rol FOREIGN KEY (id_rol) REFERENCES cursos.Roles(id_rol) ON DELETE RESTRICT ON UPDATE CASCADE
);
COMMENT ON TABLE cursos.usuarios_roles IS 'Relación muchos a muchos entre usuarios y roles.';

CREATE TRIGGER trg_usuarios_roles_updated_at
  BEFORE UPDATE ON cursos.usuarios_roles
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


-- Tabla: Sesiones (NUEVA)
-- Control de tokens JWT / sesiones activas para revocación
CREATE TABLE cursos.Sesiones (
    id_sesion SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,       -- Hash del refresh token
    dispositivo VARCHAR(100),               -- "Chrome / Windows", "WhatsApp Bot"
    ip_origen INET,
    activo BOOLEAN DEFAULT TRUE,
    fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_sesion FOREIGN KEY (id_usuario) REFERENCES cursos.Usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_token_hash UNIQUE (token_hash)
);
COMMENT ON TABLE cursos.Sesiones IS 'Control de sesiones activas para revocación de tokens JWT.';

CREATE TRIGGER trg_sesiones_updated_at
  BEFORE UPDATE ON cursos.Sesiones
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


-- =============================================================================
-- BLOQUE 2: CATÁLOGO DE CURSOS
-- =============================================================================

-- Tabla: CategoriasCursos
CREATE TABLE cursos.CategoriasCursos (
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
COMMENT ON TABLE cursos.CategoriasCursos IS 'Categorías de cursos con elementos visuales para el chatbot.';

CREATE TRIGGER trg_categorias_updated_at
  BEFORE UPDATE ON cursos.CategoriasCursos
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


-- Tabla: Etiquetas
CREATE TABLE cursos.Etiquetas (
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
COMMENT ON TABLE cursos.Etiquetas IS 'Etiquetas para clasificar categorías de cursos.';

CREATE TRIGGER trg_etiquetas_updated_at
  BEFORE UPDATE ON cursos.Etiquetas
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


-- Tabla: CategoriasEtiquetas
CREATE TABLE cursos.CategoriasEtiquetas (
    id_categoria_etiqueta SERIAL PRIMARY KEY,
    id_categoria INT NOT NULL,
    id_etiqueta INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categoria_etiqueta FOREIGN KEY (id_categoria) REFERENCES cursos.CategoriasCursos(id_categoria) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_etiqueta_categoria FOREIGN KEY (id_etiqueta) REFERENCES cursos.Etiquetas(id_etiqueta) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_categoria_etiqueta UNIQUE (id_categoria, id_etiqueta)
);
COMMENT ON TABLE cursos.CategoriasEtiquetas IS 'Relación muchos a muchos entre categorías y etiquetas.';

CREATE TRIGGER trg_categorias_etiquetas_updated_at
  BEFORE UPDATE ON cursos.CategoriasEtiquetas
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


-- Tabla: Cursos
CREATE TABLE cursos.Cursos (
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

CREATE TRIGGER trg_cursos_updated_at
  BEFORE UPDATE ON cursos.Cursos
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


-- Tabla: CursosAgentes
-- CAMBIO v2: se elimina UNIQUE(id_curso) para permitir múltiples agentes por curso.
--            Se agrega rol_agente para diferenciar responsabilidades.
CREATE TABLE cursos.CursosAgentes (
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
COMMENT ON TABLE cursos.CursosAgentes IS 'Agentes asignados a cursos. Un curso puede tener varios agentes con distintos roles.';

CREATE TRIGGER trg_cursos_agentes_updated_at
  BEFORE UPDATE ON cursos.CursosAgentes
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


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

CREATE TRIGGER trg_bancos_updated_at
  BEFORE UPDATE ON cursos.bancos
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


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

CREATE TRIGGER trg_cuentas_updated_at
  BEFORE UPDATE ON cursos.cuentas_bancarias
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


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

-- Vista auxiliar: QR vigentes (reemplaza el CHECK eliminado)
CREATE OR REPLACE VIEW cursos.vw_qr_vigentes AS
SELECT * FROM cursos.qr_cobros
WHERE activo = TRUE
  AND (fecha_expiracion IS NULL OR fecha_expiracion >= CURRENT_DATE);
COMMENT ON VIEW cursos.vw_qr_vigentes IS 'QR activos y no vencidos. Usar esta vista en lugar de consultar la tabla directamente.';

CREATE TRIGGER trg_qr_updated_at
  BEFORE UPDATE ON cursos.QRCobros
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


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

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON cursos.Leads
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


-- Tabla: Inscripciones
CREATE TABLE cursos.Inscripciones (
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
    CONSTRAINT fk_cuenta_bancaria_inscripcion FOREIGN KEY (id_cuenta_bancaria) REFERENCES cursos.CuentasBancarias(id_cuenta) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_qr_cobro_inscripcion FOREIGN KEY (id_qr_cobro) REFERENCES cursos.QRCobros(id_qr_cobro) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_metodo_pago_consistencia CHECK (
        (metodo_pago_elegido IN ('Transferencia', 'Deposito') AND id_cuenta_bancaria IS NOT NULL AND id_qr_cobro IS NULL) OR
        (metodo_pago_elegido = 'QR' AND id_qr_cobro IS NOT NULL AND id_cuenta_bancaria IS NULL) OR
        (metodo_pago_elegido IS NULL AND id_cuenta_bancaria IS NULL AND id_qr_cobro IS NULL)
    )
);
COMMENT ON TABLE cursos.Inscripciones IS 'Inscripciones de personas a cursos con seguimiento del método de pago.';

CREATE TRIGGER trg_inscripciones_updated_at
  BEFORE UPDATE ON cursos.Inscripciones
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


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
    CONSTRAINT fk_inscripcion_pago FOREIGN KEY (id_inscripcion) REFERENCES cursos.Inscripciones(id_inscripcion) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cuenta_bancaria_pago FOREIGN KEY (id_cuenta_bancaria) REFERENCES cursos.CuentasBancarias(id_cuenta) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_qr_cobro_pago FOREIGN KEY (id_qr_cobro) REFERENCES cursos.QRCobros(id_qr_cobro) ON DELETE SET NULL ON UPDATE CASCADE,
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

CREATE TRIGGER trg_pagos_updated_at
  BEFORE UPDATE ON cursos.Pagos
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


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

CREATE INDEX idx_sesiones_chat_persona ON cursos.sesiones_chatbot(id_persona);
CREATE INDEX idx_sesiones_chat_contacto ON cursos.sesiones_chatbot(numero_contacto);
CREATE INDEX idx_sesiones_chat_activa ON cursos.sesiones_chatbot(sesion_activa, ultimo_mensaje_at DESC);

CREATE TRIGGER trg_sesiones_chat_updated_at
  BEFORE UPDATE ON cursos.sesiones_chatbot
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


-- Tabla: MensajesChatbot
-- Historial completo de mensajes por sesión
CREATE TABLE cursos.mensajes_chatbot (
    id_mensaje SERIAL PRIMARY KEY,
    id_sesion_chat INT NOT NULL,
    rol VARCHAR(10) NOT NULL CHECK (rol IN ('user', 'bot', 'agente')),
    contenido TEXT NOT NULL,
    tipo_contenido VARCHAR(20) DEFAULT 'texto' CHECK (tipo_contenido IN ('texto', 'imagen', 'documento', 'boton', 'lista', 'audio')),
    metadata_json JSONB,                        -- Botones pulsados, opciones mostradas, etc.
    leido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sesion_mensaje FOREIGN KEY (id_sesion_chat) REFERENCES cursos.sesiones_chatbot(id_sesion_chat) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_contenido_mensaje CHECK (TRIM(contenido) <> '')
);
COMMENT ON TABLE cursos.mensajes_chatbot IS 'Historial de mensajes del chatbot por sesión para contexto y auditoría.';

CREATE INDEX idx_mensajes_sesion ON cursos.mensajes_chatbot(id_sesion_chat, created_at DESC);


-- Tabla: PlantillasMensaje (NUEVA)
-- Mensajes reutilizables del bot: bienvenida, confirmación de pago, recordatorios
CREATE TABLE cursos.PlantillasMensaje (
    id_plantilla SERIAL PRIMARY KEY,
    nombre_plantilla VARCHAR(100) NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN (
        'bienvenida', 'presentacion_curso', 'solicitud_datos',
        'confirmacion_inscripcion', 'solicitud_pago', 'confirmacion_pago',
        'rechazo_pago', 'recordatorio', 'encuesta', 'despedida', 'generico'
    )),
    canal VARCHAR(20) DEFAULT 'WhatsApp' CHECK (canal IN ('WhatsApp', 'Web', 'Telegram', 'Facebook', 'Todos')),
    contenido TEXT NOT NULL,                    -- Texto con variables: {{nombre}}, {{curso}}, {{precio}}
    variables_disponibles TEXT,                 -- Documentación de variables: "nombre, curso, precio, fecha"
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_nombre_plantilla CHECK (TRIM(nombre_plantilla) <> ''),
    CONSTRAINT chk_contenido_plantilla CHECK (TRIM(contenido) <> ''),
    CONSTRAINT uq_nombre_plantilla UNIQUE (nombre_plantilla)
);
COMMENT ON TABLE cursos.PlantillasMensaje IS 'Plantillas de mensajes reutilizables del chatbot con soporte de variables.';

CREATE TRIGGER trg_plantillas_updated_at
  BEFORE UPDATE ON cursos.PlantillasMensaje
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


-- Tabla: Notificaciones (NUEVA)
-- Registro de cada notificación enviada a personas
CREATE TABLE cursos.Notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    id_persona INT NOT NULL,
    id_plantilla INT,                           -- NULL si es mensaje manual
    id_curso INT,                               -- Curso relacionado si aplica
    canal VARCHAR(20) NOT NULL CHECK (canal IN ('WhatsApp', 'Email', 'SMS', 'Push')),
    asunto VARCHAR(200),                        -- Para email
    contenido TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Enviado', 'Entregado', 'Leido', 'Fallido')),
    intentos INT DEFAULT 0,
    ultimo_intento_at TIMESTAMP WITH TIME ZONE,
    error_detalle TEXT,                         -- Mensaje de error si falló
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_persona_notif FOREIGN KEY (id_persona) REFERENCES cursos.Personas(id_persona) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_plantilla_notif FOREIGN KEY (id_plantilla) REFERENCES cursos.PlantillasMensaje(id_plantilla) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_curso_notif FOREIGN KEY (id_curso) REFERENCES cursos.Cursos(id_curso) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_contenido_notif CHECK (TRIM(contenido) <> '')
);
COMMENT ON TABLE cursos.Notificaciones IS 'Registro de notificaciones enviadas a personas por cualquier canal.';

CREATE INDEX idx_notificaciones_persona ON cursos.Notificaciones(id_persona, created_at DESC);
CREATE INDEX idx_notificaciones_estado ON cursos.Notificaciones(estado, created_at);

CREATE TRIGGER trg_notificaciones_updated_at
  BEFORE UPDATE ON cursos.Notificaciones
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


-- Tabla: CampañasMarketing (NUEVA)
-- Campañas masivas de divulgación de cursos
CREATE TABLE cursos.CampañasMarketing (
    id_campana SERIAL PRIMARY KEY,
    nombre_campana VARCHAR(150) NOT NULL,
    id_curso INT,                               -- NULL si es campaña general
    id_plantilla INT NOT NULL,
    canal VARCHAR(20) NOT NULL CHECK (canal IN ('WhatsApp', 'Email', 'SMS', 'Push')),
    segmento_json JSONB,                        -- Filtros: {"estado_lead":"Interesado","id_categoria":1}
    total_destinatarios INT DEFAULT 0,
    total_enviados INT DEFAULT 0,
    total_entregados INT DEFAULT 0,
    total_leidos INT DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'Borrador' CHECK (estado IN ('Borrador', 'Programada', 'Enviando', 'Completada', 'Cancelada')),
    fecha_programada TIMESTAMP WITH TIME ZONE,
    fecha_inicio_envio TIMESTAMP WITH TIME ZONE,
    fecha_fin_envio TIMESTAMP WITH TIME ZONE,
    creado_por INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_curso_campana FOREIGN KEY (id_curso) REFERENCES cursos.Cursos(id_curso) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_plantilla_campana FOREIGN KEY (id_plantilla) REFERENCES cursos.PlantillasMensaje(id_plantilla) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_creador_campana FOREIGN KEY (creado_por) REFERENCES cursos.Usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_nombre_campana CHECK (TRIM(nombre_campana) <> '')
);
COMMENT ON TABLE cursos.CampañasMarketing IS 'Campañas masivas de divulgación con métricas de entrega y apertura.';

CREATE TRIGGER trg_campanas_updated_at
  BEFORE UPDATE ON cursos.CampañasMarketing
  FOR EACH ROW EXECUTE FUNCTION cursos.set_updated_at();


-- =============================================================================
-- BLOQUE 6: ÍNDICES DE RENDIMIENTO
-- =============================================================================

-- Personas
CREATE INDEX idx_personas_correo         ON cursos.Personas(correo);
CREATE INDEX idx_personas_ci             ON cursos.Personas(ci);
CREATE INDEX idx_personas_whatsapp       ON cursos.Personas(numero_whatsapp);

-- Cursos (consultas frecuentes del chatbot)
CREATE INDEX idx_cursos_activo_destacado ON cursos.Cursos(activo, destacado);
CREATE INDEX idx_cursos_categoria        ON cursos.Cursos(id_categoria);
CREATE INDEX idx_cursos_fecha_inicio     ON cursos.Cursos(fecha_inicio);
CREATE INDEX idx_cursos_nivel_modalidad  ON cursos.Cursos(nivel, modalidad);

-- Leads
CREATE INDEX idx_leads_persona           ON cursos.Leads(id_persona);
CREATE INDEX idx_leads_curso             ON cursos.Leads(id_curso);
CREATE INDEX idx_leads_estado            ON cursos.Leads(estado);
CREATE INDEX idx_leads_agente            ON cursos.Leads(id_agente_asignado);
CREATE INDEX idx_leads_fecha_accion      ON cursos.Leads(fecha_proxima_accion) WHERE estado NOT IN ('Inscrito', 'Perdido');

-- Inscripciones
CREATE INDEX idx_inscripciones_persona   ON cursos.Inscripciones(id_persona);
CREATE INDEX idx_inscripciones_curso     ON cursos.Inscripciones(id_curso);
CREATE INDEX idx_inscripciones_estado    ON cursos.Inscripciones(estado);

-- Pagos
CREATE INDEX idx_pagos_inscripcion       ON cursos.Pagos(id_inscripcion);
CREATE INDEX idx_pagos_estado            ON cursos.Pagos(estado);
CREATE INDEX idx_pagos_fecha_reportada   ON cursos.Pagos(fecha_pago_reportada);

-- Usuarios y roles
CREATE INDEX idx_usuarios_persona        ON cursos.Usuarios(id_persona);
CREATE INDEX idx_usuarios_roles_usuario  ON cursos.usuarios_roles(id_usuario);


-- =============================================================================
-- BLOQUE 7: DATOS INICIALES
-- =============================================================================

INSERT INTO cursos.Roles (nombre_rol, descripcion) VALUES
('Administrador', 'Acceso completo al sistema'),
('Agente', 'Gestión de cursos y leads asignados'),
('UsuarioRegistrado', 'Usuario final del sistema');

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

-- Plantillas de mensaje iniciales para el chatbot
INSERT INTO cursos.plantillas_mensaje (nombre_plantilla, tipo, canal, contenido, variables_disponibles) VALUES
('bienvenida_general', 'bienvenida', 'WhatsApp',
 '¡Hola {{nombre}}! 👋 Bienvenido/a a nuestro centro de formación académica. Estoy aquí para ayudarte a encontrar el curso ideal para ti. ¿Qué área te interesa?',
 'nombre'),
('presentacion_curso', 'presentacion_curso', 'WhatsApp',
 '📚 *{{nombre_curso}}*\n\n{{descripcion_corta}}\n\n💰 Precio: Bs. {{precio}}\n📅 Inicio: {{fecha_inicio}}\n⏱ Duración: {{duracion_semanas}} semanas\n\n¿Te interesa inscribirte?',
 'nombre_curso, descripcion_corta, precio, fecha_inicio, duracion_semanas'),
('confirmacion_inscripcion', 'confirmacion_inscripcion', 'WhatsApp',
 '✅ ¡Inscripción registrada, {{nombre}}!\n\nTu inscripción al curso *{{nombre_curso}}* ha sido recibida. Para confirmar tu lugar, realiza el pago de Bs. {{precio}} y envíanos el comprobante.',
 'nombre, nombre_curso, precio'),
('solicitud_pago', 'solicitud_pago', 'WhatsApp',
 '💳 Para completar tu inscripción a *{{nombre_curso}}*, puedes realizar el pago de Bs. {{precio}} mediante:\n\n🏦 Transferencia/Depósito\n📱 Código QR\n\n¿Cuál prefieres?',
 'nombre_curso, precio'),
('confirmacion_pago', 'confirmacion_pago', 'WhatsApp',
 '🎉 ¡Pago confirmado, {{nombre}}!\n\nYa estás inscrito/a en *{{nombre_curso}}*. El curso inicia el {{fecha_inicio}}. Recibirás más detalles próximamente.',
 'nombre, nombre_curso, fecha_inicio'),
('recordatorio_inicio', 'recordatorio', 'WhatsApp',
 '⏰ Recordatorio: El curso *{{nombre_curso}}* comienza en {{dias_restantes}} días ({{fecha_inicio}}). ¡Te esperamos!',
 'nombre_curso, dias_restantes, fecha_inicio');