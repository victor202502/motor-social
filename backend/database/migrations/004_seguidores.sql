-- 004_seguidores.sql
--
-- Relación de "seguir" entre usuarios (autorreferencial). seguidor_id sigue
-- a seguido_id. PK compuesta evita duplicados; ON DELETE CASCADE limpia la
-- relación si se borra cualquiera de los dos usuarios.
--
-- CREATE TABLE IF NOT EXISTS: no toca ninguna fila existente.

CREATE TABLE IF NOT EXISTS seguidores (
    seguidor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    seguido_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (seguidor_id, seguido_id)
);
