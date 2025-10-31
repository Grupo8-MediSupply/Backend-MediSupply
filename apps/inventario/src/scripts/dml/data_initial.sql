-- 🇨🇴 Vehículos en Colombia
INSERT INTO logistica.vehiculo (marca, modelo, placa, pais_id, ubicacion, activo)
VALUES
('Toyota', 'Hilux', 'ABC123', 10, ST_GeographyFromText('SRID=4326;POINT(-74.08175 4.60971)'), TRUE), -- Bogotá
('Renault', 'Kangoo', 'XYZ987', 10, ST_GeographyFromText('SRID=4326;POINT(-75.69719 4.81333)'), TRUE), -- Ibagué
('Chevrolet', 'N300', 'JKL456', 10, ST_GeographyFromText('SRID=4326;POINT(-76.5225 3.4516)'), FALSE); -- Cali (inactivo)

-- 🇲🇽 Vehículos en México
INSERT INTO logistica.vehiculo (marca, modelo, placa, pais_id, ubicacion, activo)
VALUES
('Nissan', 'NP300', 'MEX001', 20, ST_GeographyFromText('SRID=4326;POINT(-99.1332 19.4326)'), TRUE), -- Ciudad de México
('Ford', 'Ranger', 'MEX002', 20, ST_GeographyFromText('SRID=4326;POINT(-100.3161 25.6866)'), TRUE), -- Monterrey
('Volkswagen', 'Transporter', 'MEX003', 20, ST_GeographyFromText('SRID=4326;POINT(-103.3496 20.6597)'), FALSE); -- Guadalajara (inactivo)
