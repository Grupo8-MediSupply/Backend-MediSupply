-- Insertar registros iniciales para pais
INSERT INTO geografia.pais (id, codigo_iso, nombre, moneda, simbolo_moneda, zona_horaria, idioma_oficial)
VALUES
    (10, 'COL', 'Colombia', 'Peso colombiano', '$', 'America/Bogota', 'Español'),
    (20, 'MEX', 'México', 'Peso mexicano', '$', 'America/Mexico_City', 'Español');


-- Insertar roles iniciales
INSERT INTO seguridad.rol (id, nombre, descripcion)
VALUES
    (20, 'Vendedor', 'Rol encargado de ventas'),
    (30, 'Proveedor', 'Rol de proveedor de productos');
