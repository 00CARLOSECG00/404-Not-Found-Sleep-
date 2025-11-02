-- Script SQL para crear la tabla en Supabase
-- Ejecutar en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS mediciones_hidrologicas (
    id BIGSERIAL PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL,
    nivel_m DECIMAL(10, 2) NOT NULL,
    lluvia_mm DECIMAL(10, 2) NOT NULL,
    base_level DECIMAL(10, 2),
    delta_h DECIMAL(10, 2),
    ror DECIMAL(10, 4),  -- Rate of Rise en m/hora
    intensidad_lluvia DECIMAL(10, 2),  -- mm/hora
    proyeccion_30min DECIMAL(10, 2),
    pendiente_hidraulica DECIMAL(10, 6),
    persistencia INTEGER,
    procesado_en TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas por timestamp
CREATE INDEX IF NOT EXISTS idx_mediciones_ts ON mediciones_hidrologicas(ts);

-- Índice para búsquedas por fecha de procesamiento
CREATE INDEX IF NOT EXISTS idx_mediciones_procesado ON mediciones_hidrologicas(procesado_en);

