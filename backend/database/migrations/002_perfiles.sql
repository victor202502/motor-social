-- 002_perfiles.sql
--
-- Añade bio y avatar a usuarios, para la página de perfil.
-- ADD COLUMN IF NOT EXISTS es idempotente y no toca ninguna fila existente:
-- los usuarios ya creados simplemente tendrán estos campos a NULL hasta que
-- editen su perfil.

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);
