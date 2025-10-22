-- Insertar registros iniciales para pais
INSERT INTO geografia.pais (id, codigo_iso, nombre, moneda,sigla_moneda, simbolo_moneda, zona_horaria, idioma_oficial)
VALUES
    (10, 'COL', 'Colombia', 'Peso colombiano', 'COP', '$', 'America/Bogota', 'Español'),
    (20, 'MEX', 'México', 'Peso mexicano', 'MXN', '$', 'America/Mexico_City', 'Español');


-- Insertar roles iniciales
INSERT INTO seguridad.rol (id, nombre, descripcion)
VALUES
(1, 'Administrador', 'Rol con permisos administrativos'),
(30, 'Cliente', 'Rol de cliente'),
    (20, 'Vendedor', 'Rol encargado de ventas'),
    (40, 'Proveedor', 'Rol de proveedor de productos');

-- Insertar tipos de identificación iniciales
INSERT INTO usuarios.tipo_identificacion (id, pais_id, nombre, descripcion)
VALUES
(1, 10, 'CC', 'CEDULA DE CIUDADANIA'),
(2, 10, 'NIT', 'NUMERO DE IDENTIFICACION TRIBUTARIA'),
(3, 20, 'RFC', 'REGISTRO FEDERAL DE CONTRIBUYENTES'),
(4, 20, 'CURP', 'CLAVE UNICA DE REGISTRO DE POBLACION');

-- Administradores iniciales (uno por país)
INSERT INTO usuarios.usuario (
    email,
    password_hash,
    identificacion,
    tipo_identificacion,
    rol_id,
    pais_id,
)
VALUES
    ('admin.colombia@example.com', 'ChangeMe123!', '800000001', 'CC', 1, 10),
    ('admin.mexico@example.com', 'ChangeMe123!', 'RFC0000001', 'RFC', 1, 20);