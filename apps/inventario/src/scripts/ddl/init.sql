-- ============================
-- Extensiones y schemas
-- ============================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS productos;
CREATE SCHEMA IF NOT EXISTS regulacion;
CREATE SCHEMA IF NOT EXISTS logistica;




--------------------------------------------------------------------------------
-- B) Productos / Productos globales
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos.producto_global (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Removed trigger creation since usuarios.set_updated_at() function may not exist
-- CREATE TRIGGER IF NOT EXISTS trg_producto_global_updated
--     BEFORE UPDATE ON productos.producto_global
--     FOR EACH ROW
--     EXECUTE FUNCTION usuarios.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_producto_global_sku ON productos.producto_global(sku);

CREATE TABLE IF NOT EXISTS productos.medicamento (
    producto_global_id BIGINT PRIMARY KEY REFERENCES productos.producto_global(id) ON DELETE CASCADE,
    forma_farmaceutica VARCHAR(100),
    concentracion VARCHAR(100),
    principio_activo VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS productos.insumo_medico (
    producto_global_id BIGINT PRIMARY KEY REFERENCES productos.producto_global(id) ON DELETE CASCADE,
    material VARCHAR(100),
    esteril BOOLEAN,
    uso_unico BOOLEAN
);

CREATE TABLE IF NOT EXISTS productos.equipo_medico (
    producto_global_id BIGINT PRIMARY KEY REFERENCES productos.producto_global(id) ON DELETE CASCADE,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    vida_util INT,
    requiere_mantenimiento BOOLEAN
);

--------------------------------------------------------------------------------
-- D) Regulaciones y condiciones de almacenamiento (moved before producto_regional)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS regulacion.regulacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pais_id BIGINT, -- Removed reference since geografia.pais may not exist
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tipo_norma VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS regulacion.condicion_almacenamiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    temperatura_min NUMERIC(5,2),
    temperatura_max NUMERIC(5,2),
    humedad_min NUMERIC(5,2),
    humedad_max NUMERIC(5,2),
    otras_condiciones TEXT
);

--------------------------------------------------------------------------------
-- C) Producto regional (now after regulacion tables)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos.producto_regional (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_global_id BIGINT NOT NULL REFERENCES productos.producto_global(id),
    pais_id BIGINT NOT NULL, -- Removed reference since geografia.pais may not exist
    proveedor_id UUID NOT NULL, -- Removed reference since usuarios.proveedor may not exist

    -- nueva FK para relacionar la regulación aplicable a este producto en ese país
    regulacion_id UUID REFERENCES regulacion.regulacion(id),
    precio NUMERIC(12,2) NOT NULL,
    moneda VARCHAR(10),
    disponible BOOLEAN DEFAULT true,
    estado_registro_sanitario VARCHAR(100),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Removed trigger creation since usuarios.set_updated_at() function may not exist
-- CREATE TRIGGER IF NOT EXISTS trg_producto_regional_updated
--     BEFORE UPDATE ON productos.producto_regional
--     FOR EACH ROW
--     EXECUTE FUNCTION usuarios.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_producto_regional ON productos.producto_regional(producto_global_id, pais_id);

--------------------------------------------------------------------------------
-- E) Logística: lote, bodega, inventario
--    => lote ahora referencia condicion_almacenamiento
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logistica.lote (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_regional_id UUID NOT NULL REFERENCES productos.producto_regional(id),
    numero VARCHAR(100) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    cantidad_inicial INT NOT NULL,
    estado VARCHAR(50) NOT NULL,
    -- nueva FK para condiciones de almacenamiento específicas para este lote
    condicion_almacenamiento_id UUID REFERENCES regulacion.condicion_almacenamiento(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Removed trigger creation since usuarios.set_updated_at() function may not exist
-- CREATE TRIGGER IF NOT EXISTS trg_lote_updated
--     BEFORE UPDATE ON logistica.lote
--     FOR EACH ROW
--     EXECUTE FUNCTION usuarios.set_updated_at();

CREATE TABLE IF NOT EXISTS logistica.bodega (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pais_id BIGINT NOT NULL, -- Removed reference since geografia.pais may not exist
    nombre VARCHAR(150) NOT NULL,
    ubicacion VARCHAR(255),
    capacidad INT,
    responsable VARCHAR(150),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Removed trigger creation since usuarios.set_updated_at() function may not exist
-- CREATE TRIGGER IF NOT EXISTS trg_bodega_updated
--     BEFORE UPDATE ON logistica.bodega
--     FOR EACH ROW
--     EXECUTE FUNCTION usuarios.set_updated_at();

CREATE TABLE IF NOT EXISTS logistica.inventario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bodega_id UUID NOT NULL REFERENCES logistica.bodega(id) ON DELETE CASCADE,
    lote_id UUID NOT NULL REFERENCES logistica.lote(id) ON DELETE CASCADE,
    cantidad_disponible INT NOT NULL CHECK (cantidad_disponible >= 0),
    reservado INT DEFAULT 0 CHECK (reservado >= 0),
    fecha_ultimo_movimiento DATE DEFAULT now(),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (bodega_id, lote_id)
);

-- Removed trigger creation since usuarios.set_updated_at() function may not exist
-- CREATE TRIGGER IF NOT EXISTS trg_inventario_updated
--     BEFORE UPDATE ON logistica.inventario
--     FOR EACH ROW
--     EXECUTE FUNCTION usuarios.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_inventario_bodega ON logistica.inventario(bodega_id);
CREATE INDEX IF NOT EXISTS idx_inventario_lote ON logistica.inventario(lote_id);