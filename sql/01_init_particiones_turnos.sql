-- ==============================================================================
-- Script de inicialización: Particionado de la tabla Turnos
-- Estrategia: Range Partitioning (Por mes)
-- ==============================================================================

-- 1. Eliminar la tabla si existe para evitar conflictos en la recreación
DROP TABLE IF EXISTS turnos CASCADE;

-- 2. Creación de la tabla padre (Enrutador)
CREATE TABLE turnos (
    id SERIAL,
    fecha TIMESTAMP NOT NULL,
    paciente_id INTEGER REFERENCES pacientes(id),
    medico_id INTEGER REFERENCES medicos(id),
    motivo VARCHAR,
    -- En particionado por rango, la columna de partición debe ser Primary Key
    PRIMARY KEY (id, fecha)
) PARTITION BY RANGE (fecha);

-- 3. Creación de las particiones físicas mensuales
CREATE TABLE turnos_2026_06 PARTITION OF turnos 
FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE turnos_2026_07 PARTITION OF turnos 
FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE turnos_2026_08 PARTITION OF turnos 
FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');