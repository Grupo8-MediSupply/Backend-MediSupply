-- ===========================================
--  SCHEMA: pedidos
-- ===========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE SCHEMA IF NOT EXISTS pedidos;

-- ===========================================
--  ENUM: estado_orden
-- ===========================================
CREATE TYPE pedidos.estado_orden AS ENUM (
  'RECIBIDO',
  'PROCESANDO',
  'ENVIADO',
  'COMPLETADO',
  'CANCELADO'
);


-- ===========================================
--  TABLE: pedidos.orden
-- ===========================================
CREATE TABLE IF NOT EXISTS pedidos.orden (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    cliente_id UUID NOT NULL,
    vendedor_id UUID NULL,

    estado pedidos.estado_orden NOT NULL DEFAULT 'PROCESANDO',

    productos_snapshot JSONB NULL,
    total NUMERIC(12,2) NOT NULL CHECK (total >= 0),

    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ===========================================
--  TABLE: pedidos.orden_detalle
-- ===========================================
CREATE TABLE IF NOT EXISTS pedidos.orden_detalle (
    orden_id UUID NOT NULL REFERENCES pedidos.orden(id) ON DELETE CASCADE,
    lote_id UUID NOT NULL REFERENCES logistica.lote(id) ON DELETE RESTRICT,
    bodega_id UUID NOT NULL REFERENCES logistica.bodega(id) ON DELETE RESTRICT,
    producto_regional_id UUID NOT NULL REFERENCES productos.producto_regional(id) ON DELETE RESTRICT,

    cantidad NUMERIC(10,2) NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,

    PRIMARY KEY (orden_id, lote_id, bodega_id)
);



-- ===========================================
--  ÍNDICES OPTIMIZADOS PARA REPORTES
-- ===========================================

-- Índices existentes para órdenes
CREATE INDEX IF NOT EXISTS idx_orden_cliente 
ON pedidos.orden (cliente_id);

CREATE INDEX IF NOT EXISTS idx_orden_estado 
ON pedidos.orden (estado);

CREATE INDEX IF NOT EXISTS idx_orden_vendedor 
ON pedidos.orden (vendedor_id);

-- Índice compuesto cliente + estado para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_orden_cliente_estado
ON pedidos.orden (cliente_id, estado);

-- Índice compuesto vendedor + estado para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_orden_vendedor_estado
ON pedidos.orden (vendedor_id, estado);

-- Índices existentes para detalle de órdenes
CREATE INDEX IF NOT EXISTS idx_detalle_orden 
ON pedidos.orden_detalle (orden_id);

CREATE INDEX IF NOT EXISTS idx_detalle_bodega 
ON pedidos.orden_detalle (bodega_id);

CREATE INDEX IF NOT EXISTS idx_detalle_lote 
ON pedidos.orden_detalle (lote_id);

-- Índice para producto_regional_id para consultar productos más vendidos
CREATE INDEX IF NOT EXISTS idx_detalle_producto_regional
ON pedidos.orden_detalle (producto_regional_id);

-- Índice compuesto producto + orden_id para reportes por rango de fechas
CREATE INDEX IF NOT EXISTS idx_detalle_producto_fecha
ON pedidos.orden_detalle (producto_regional_id, orden_id);


-- ===========================================
--  TRIGGER: actualizar updated_at
-- ===========================================
CREATE OR REPLACE FUNCTION pedidos.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orden_updated
    BEFORE UPDATE ON pedidos.orden
    FOR EACH ROW
    EXECUTE FUNCTION pedidos.set_updated_at();


ALTER TABLE pedidos.orden
ADD COLUMN pais_id INT REFERENCES geografia.pais(id);


-- ===========================================
--  TABLA: logistica.rutas
-- ===========================================

CREATE TABLE IF NOT EXISTS logistica.rutas (
    vehiculo_id UUID NOT NULL,
    orden_id UUID NOT NULL,
    ruta_json JSONB NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT rutas_pk PRIMARY KEY (vehiculo_id, orden_id),

    CONSTRAINT rutas_vehiculo_fk FOREIGN KEY (vehiculo_id)
        REFERENCES logistica.vehiculo (id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT rutas_orden_fk FOREIGN KEY (orden_id)
        REFERENCES pedidos.orden (id)
        ON UPDATE CASCADE ON DELETE CASCADE
);


