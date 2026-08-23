-- 005_publicaciones.sql
--
-- Publicaciones: contenido tipo "post" (texto + imagen opcional), separado
-- de los coches del garaje, con su propio coche_id opcional para poder
-- etiquetar un coche cuando corresponda.

CREATE TABLE IF NOT EXISTS publicaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    coche_id INTEGER REFERENCES coches(id) ON DELETE SET NULL,
    texto TEXT,
    imagen_url VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS publicacion_likes (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    publicacion_id INTEGER NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, publicacion_id)
);

CREATE TABLE IF NOT EXISTS publicacion_comentarios (
    id SERIAL PRIMARY KEY,
    publicacion_id INTEGER NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);