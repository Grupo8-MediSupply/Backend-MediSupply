-- ======================================
-- Extensiones necesarias
-- ======================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================
-- Crear schemas (asegurarse de que existan antes de todo lo demás)
-- ======================================
CREATE SCHEMA IF NOT EXISTS geografia;
CREATE SCHEMA IF NOT EXISTS seguridad;
CREATE SCHEMA IF NOT EXISTS usuarios;

-- ======================================
-- Función genérica para manejar updated_at
-- ======================================
-- ✅ No uses DO/EXECUTE aquí, simplemente créala directamente
CREATE OR REPLACE FUNCTION usuarios.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ======================================
-- Geografía
-- ======================================
CREATE TABLE IF NOT EXISTS geografia.pais (
    id BIGSERIAL PRIMARY KEY,
    codigo_iso CHAR(3) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    moneda VARCHAR(50),
    simbolo_moneda VARCHAR(10),
    sigla_moneda VARCHAR(6),
    zona_horaria VARCHAR(100),
    idioma_oficial VARCHAR(100),
    regulador_sanitario VARCHAR(150)
);

-- ======================================
-- Seguridad
-- ======================================
CREATE TABLE IF NOT EXISTS seguridad.rol (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER trg_rol_updated
    BEFORE UPDATE ON seguridad.rol
    FOR EACH ROW
    EXECUTE FUNCTION usuarios.set_updated_at();

CREATE TABLE IF NOT EXISTS seguridad.permiso (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER trg_permiso_updated
    BEFORE UPDATE ON seguridad.permiso
    FOR EACH ROW
    EXECUTE FUNCTION usuarios.set_updated_at();

CREATE TABLE IF NOT EXISTS seguridad.rol_permiso (
    rol_id BIGINT REFERENCES seguridad.rol(id) ON DELETE CASCADE,
    permiso_id BIGINT REFERENCES seguridad.permiso(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

-- ======================================
-- Usuarios
-- ======================================
CREATE TABLE IF NOT EXISTS usuarios.tipo_identificacion (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    pais_id BIGINT NOT NULL REFERENCES geografia.pais(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (pais_id, codigo)
);

CREATE TRIGGER trg_tipo_identificacion_updated
    BEFORE UPDATE ON usuarios.tipo_identificacion
    FOR EACH ROW
    EXECUTE FUNCTION usuarios.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_tipo_identificacion_pais
    ON usuarios.tipo_identificacion(pais_id);

CREATE TABLE IF NOT EXISTS usuarios.usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    identificacion VARCHAR(30) NOT NULL,
    tipo_identificacion_id BIGINT REFERENCES usuarios.tipo_identificacion(id),
    rol_id BIGINT REFERENCES seguridad.rol(id),
    pais_id BIGINT REFERENCES geografia.pais(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TRIGGER trg_usuario_updated
    BEFORE UPDATE ON usuarios.usuario
    FOR EACH ROW
    EXECUTE FUNCTION usuarios.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_usuario_email
    ON usuarios.usuario(email);

CREATE INDEX IF NOT EXISTS idx_usuario_pais
    ON usuarios.usuario(pais_id);

CREATE INDEX IF NOT EXISTS idx_usuario_tipo_identificacion
    ON usuarios.usuario(tipo_identificacion_id);

CREATE TABLE IF NOT EXISTS usuarios.cliente (
    id UUID PRIMARY KEY REFERENCES usuarios.usuario(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    tipo_institucion VARCHAR(100),
    clasificacion VARCHAR(100),
    responsable_contacto VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS usuarios.vendedor (
    id UUID PRIMARY KEY REFERENCES usuarios.usuario(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    territorio VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS usuarios.administrador (
    id UUID PRIMARY KEY REFERENCES usuarios.usuario(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS usuarios.encargado_inventario (
    id UUID PRIMARY KEY REFERENCES usuarios.usuario(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS usuarios.auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID NOT NULL REFERENCES usuarios.usuario(id),
    accion VARCHAR(200) NOT NULL,
    ubicacion_actor VARCHAR(150),
    timestamp TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_actor
    ON usuarios.auditoria(actor_id);

CREATE TABLE IF NOT EXISTS usuarios.proveedor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    contacto_principal VARCHAR(150),
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER trg_proveedor_updated
    BEFORE UPDATE ON usuarios.proveedor
    FOR EACH ROW
    EXECUTE FUNCTION usuarios.set_updated_at();

CREATE TABLE IF NOT EXISTS usuarios.visita_cliente (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES usuarios.cliente(id) ON DELETE CASCADE,
    vendedor_id UUID NOT NULL REFERENCES usuarios.vendedor(id) ON DELETE CASCADE,
    fecha_visita TIMESTAMP NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADA',
    comentarios TEXT,
    url_video TEXT NULL,
    recomendacion TEXT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER trg_visita_cliente_updated
    BEFORE UPDATE ON usuarios.visita_cliente
    FOR EACH ROW
    EXECUTE FUNCTION usuarios.set_updated_at();

-- Asegúrate de que la extensión PostGIS esté habilitada
CREATE EXTENSION IF NOT EXISTS postgis;

-- Alterar tabla para agregar la columna de ubicación
ALTER TABLE usuarios.usuario
ADD COLUMN ubicacion geography(Point, 4326);

-- Opcional: agregar índice espacial para consultas eficientes por distancia
CREATE INDEX IF NOT EXISTS idx_usuario_ubicacion
ON usuarios.usuario
USING GIST(ubicacion);

    
    
