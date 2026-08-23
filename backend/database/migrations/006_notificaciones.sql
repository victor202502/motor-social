-- 006_notificaciones.sql
--
-- Notificaciones simples (sin WebSocket, solo tabla + API): nuevo seguidor,
-- like/comentario en un coche, like/comentario en una publicación.
-- usuario_id = quien recibe; actor_id = quien generó la notificación.
-- referencia_id guarda el id del coche/publicación relacionado (o NULL si
-- es un "nuevo seguidor", que no tiene referencia).
--
-- CREATE TABLE IF NOT EXISTS: no afecta a ninguna fila existente.

CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    actor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL,
    referencia_id INTEGER,
    leida BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
