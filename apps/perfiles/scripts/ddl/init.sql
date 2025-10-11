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
-- ======================================
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

-- ======================================
-- Usuarios y cuentas
-- ======================================
CREATE TABLE rol (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER trg_rol_updated
    BEFORE UPDATE ON rol
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TABLE permiso (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER trg_permiso_updated
    BEFORE UPDATE ON permiso
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TABLE rol_permiso (
    rol_id BIGINT REFERENCES rol(id) ON DELETE CASCADE,
    permiso_id BIGINT REFERENCES permiso(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol_id BIGINT REFERENCES rol(id),
    pais_id BIGINT REFERENCES pais(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER trg_usuario_updated
    BEFORE UPDATE ON usuario
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_pais ON usuario(pais_id);

-- Subtipos de usuario
CREATE TABLE cliente (
    id UUID PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    tipo_institucion VARCHAR(100),
    clasificacion VARCHAR(100),
    responsable_contacto VARCHAR(150)
);

CREATE TABLE vendedor (
    id UUID PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    territorio VARCHAR(150)
);

CREATE TABLE administrador (
    id UUID PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE encargado_inventario (
    id UUID PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID NOT NULL REFERENCES usuario(id),
    accion VARCHAR(200) NOT NULL,
    ubicacion_actor VARCHAR(150),
    timestamp TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_auditoria_actor ON auditoria(actor_id);

