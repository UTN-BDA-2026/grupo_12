-- ==============================================================================
-- Script de inicialización: Particionado de la tabla Turnos
-- Estrategia: Range Partitioning (Por mes) - Sincronizado con models.py
-- ==============================================================================

-- 1. Eliminar la tabla si existe para evitar conflictos en la recreación
DROP TABLE IF EXISTS turnos CASCADE;

-- 2. Creación de la tabla padre (Enrutador con todas las columnas modernas)
CREATE TABLE turnos (
    id SERIAL,
    fecha TIMESTAMP NOT NULL,
    paciente_id INTEGER REFERENCES pacientes(id),
    medico_id INTEGER REFERENCES medicos(id),
    motivo VARCHAR,
    estado VARCHAR(50) DEFAULT 'Pendiente',
    notas TEXT,
    monto_obra_social NUMERIC(10, 2) DEFAULT 0.00, -- COLUMNA AGREGADA PARA SEGUROS
    monto_copago NUMERIC(10, 2) DEFAULT 0.00,
    -- En particionado por rango, la columna de partición debe ser parte de la Primary Key
    PRIMARY KEY (id, fecha)
) PARTITION BY RANGE (fecha);

-- 3. Creación de las particiones físicas mensuales para cubrir todo el año 2026
CREATE TABLE turnos_2026_01 PARTITION OF turnos FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE turnos_2026_02 PARTITION OF turnos FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE turnos_2026_03 PARTITION OF turnos FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE turnos_2026_04 PARTITION OF turnos FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE turnos_2026_05 PARTITION OF turnos FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE turnos_2026_06 PARTITION OF turnos FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE turnos_2026_07 PARTITION OF turnos FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE turnos_2026_08 PARTITION OF turnos FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE turnos_2026_09 PARTITION OF turnos FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE turnos_2026_10 PARTITION OF turnos FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE turnos_2026_11 PARTITION OF turnos FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE turnos_2026_12 PARTITION OF turnos FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');