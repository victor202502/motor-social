-- 003_coches_avanzado.sql
--
-- Amplía coches con más información (potencia, kilometraje, color) y añade
-- una tabla para fotos adicionales por coche (la foto_url de coches sigue
-- siendo la foto principal / de portada, sin cambios).
--
-- ADD COLUMN IF NOT EXISTS y CREATE TABLE IF NOT EXISTS: no toca ninguna
-- fila existente. Los coches actuales quedan con estos campos a NULL.

ALTER TABLE coches ADD COLUMN IF NOT EXISTS potencia_cv INTEGER;
ALTER TABLE coches ADD COLUMN IF NOT EXISTS kilometraje INTEGER;
ALTER TABLE coches ADD COLUMN IF NOT EXISTS color VARCHAR(50);

CREATE TABLE IF NOT EXISTS coche_fotos (
    id SERIAL PRIMARY KEY,
    coche_id INTEGER NOT NULL REFERENCES coches(id) ON DELETE CASCADE,
    foto_url VARCHAR(255) NOT NULL,
    orden INTEGER DEFAULT 0
);
