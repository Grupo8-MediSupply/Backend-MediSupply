CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================
-- Función genérica para manejar updated_at
-- ======================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ======================================
-- Geografía
-- ======================================-- ======================================
-- Crear schemas
-- ======================================
CREATE SCHEMA IF NOT EXISTS geografia;
CREATE SCHEMA IF NOT EXISTS seguridad;
CREATE SCHEMA IF NOT EXISTS usuarios;

-- ======================================
-- Extensiones necesarias
-- ======================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================
-- Función genérica para manejar updated_at
-- ======================================
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
CREATE TABLE geografia.pais (
    id BIGINT PRIMARY KEY,
    codigo_iso CHAR(3) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    moneda VARCHAR(50),
    simbolo_moneda VARCHAR(10),
    zona_horaria VARCHAR(100),
    idioma_oficial VARCHAR(100),
    regulador_sanitario VARCHAR(150)
);


-- ======================================
-- Roles y permisos
-- ======================================
CREATE TABLE seguridad.rol (
    id BIGINT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER trg_rol_updated
    BEFORE UPDATE ON seguridad.rol
    FOR EACH ROW
    EXECUTE FUNCTION usuarios.set_updated_at();

CREATE TABLE seguridad.permiso (
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

CREATE TABLE seguridad.rol_permiso (
    rol_id BIGINT REFERENCES seguridad.rol(id) ON DELETE CASCADE,
    permiso_id BIGINT REFERENCES seguridad.permiso(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);
-- ======================================
-- Usuarios
-- ======================================
CREATE TABLE usuarios.usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol_id BIGINT REFERENCES seguridad.rol(id),
    pais_id BIGINT REFERENCES geografia.pais(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER trg_usuario_updated
    BEFORE UPDATE ON usuarios.usuario
    FOR EACH ROW
    EXECUTE FUNCTION usuarios.set_updated_at();

CREATE INDEX idx_usuario_email ON usuarios.usuario(email);
CREATE INDEX idx_usuario_pais ON usuarios.usuario(pais_id);

-- Subtipos de usuario
CREATE TABLE usuarios.cliente (
    id UUID PRIMARY KEY REFERENCES usuarios.usuario(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    tipo_institucion VARCHAR(100),
    clasificacion VARCHAR(100),
    responsable_contacto VARCHAR(150)
);

CREATE TABLE usuarios.vendedor (
    id UUID PRIMARY KEY REFERENCES usuarios.usuario(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    territorio VARCHAR(150)
);

CREATE TABLE usuarios.administrador (
    id UUID PRIMARY KEY REFERENCES usuarios.usuario(id) ON DELETE CASCADE
);

CREATE TABLE usuarios.encargado_inventario (
    id UUID PRIMARY KEY REFERENCES usuarios.usuario(id) ON DELETE CASCADE
);

CREATE TABLE usuarios.auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID NOT NULL REFERENCES usuarios.usuario(id),
    accion VARCHAR(200) NOT NULL,
    ubicacion_actor VARCHAR(150),
    timestamp TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_auditoria_actor ON usuarios.auditoria(actor_id);
CREATE TABLE pais (
    id BIGSERIAL PRIMARY KEY,
    codigo_iso CHAR(3) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    moneda VARCHAR(50),
    simbolo_moneda VARCHAR(10),
    zona_horaria VARCHAR(100),
    idioma_oficial VARCHAR(100),
    regulador_sanitario VARCHAR(150)
);

CREATE TABLE usuarios.proveedor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    contacto VARCHAR(150),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER trg_proveedor_updated
    BEFORE UPDATE ON usuarios.proveedor
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
