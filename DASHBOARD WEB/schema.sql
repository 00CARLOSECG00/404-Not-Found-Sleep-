-- Script SQL para crear la tabla tbl_Comunidad en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- Crear enum para roles si no existe
DO $$ BEGIN
    CREATE TYPE enum_rol_comunidad AS ENUM ('Residente', 'Administrador', 'Observador');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Crear tabla de comunidad
CREATE TABLE IF NOT EXISTS tbl_Comunidad (
    comunidad_id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) UNIQUE NOT NULL,
    rol enum_rol_comunidad DEFAULT 'Residente',
    direccion_notas TEXT,
    es_arrendatario BOOLEAN DEFAULT false,
    esta_activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para búsquedas por teléfono
CREATE INDEX IF NOT EXISTS idx_comunidad_telefono ON tbl_Comunidad(telefono);

-- Índice para búsquedas por estado activo
CREATE INDEX IF NOT EXISTS idx_comunidad_activo ON tbl_Comunidad(esta_activo);

