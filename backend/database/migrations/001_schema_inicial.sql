-- 001_schema_inicial.sql
--
-- Estructura ACTUAL de MotorSocial (usuarios, coches, comentarios, me_gusta),
-- extraída directamente de schema.sql (el volcado real de producción).
--
-- Usa CREATE TABLE IF NOT EXISTS a propósito: en la base de datos real estas
-- tablas YA EXISTEN con datos. Esta migración debe poder ejecutarse contra
-- ella sin romper ni duplicar nada (cada CREATE TABLE simplemente no hace
-- nada si la tabla ya existe), y a la vez dejar la estructura completa y
-- correcta en una base nueva y vacía.
--
-- Las claves foráneas y UNIQUE se definen en línea, no con ALTER TABLE
-- posterior, porque Postgres no soporta "ADD CONSTRAINT IF NOT EXISTS" para
-- constraints normales — así evitamos que la migración falle si ya existen.

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coches (
    id SERIAL PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    "año" INTEGER,
    propietario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    descripcion TEXT,
    foto_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    coche_id INTEGER REFERENCES coches(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS me_gusta (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    coche_id INTEGER NOT NULL REFERENCES coches(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, coche_id)
);
