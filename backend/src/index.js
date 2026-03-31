require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;

app.use(express.json());

// ==========================================
// MIDDLEWARES (Los "Porteros")
// ==========================================
const autenticarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "No hay token, acceso denegado" });

    jwt.verify(token, SECRET_KEY, (err, usuario) => {
        if (err) return res.status(403).json({ error: "Token no válido o expirado" });
        req.usuario = usuario;
        next();
    });
};

// ==========================================
// RUTAS GET (Consultas)
// ==========================================

// 1. Salud del servidor
app.get('/', (req, res) => {
    res.send('API de Red Social del Motor funcionando 🚗💨');
});

// 2. Listar todos los usuarios (público)
app.get('/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nombre, email, fecha_registro FROM usuarios');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

// 3. Listar todos los coches con sus dueños (público)
app.get('/coches-detallados', async (req, res) => {
    try {
        const query = `
            SELECT coches.*, usuarios.nombre as nombre_propietario 
            FROM coches 
            JOIN usuarios ON coches.propietario_id = usuarios.id
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener coches" });
    }
});

// 4. Ver MI GARAJE (protegido)
app.get('/mis-coches', autenticarToken, async (req, res) => {
    try {
        const query = 'SELECT * FROM coches WHERE propietario_id = $1';
        const result = await pool.query(query, [req.usuario.id]);
        res.json({
            usuario: req.usuario.nombre,
            total: result.rowCount,
            garaje: result.rows
        });
    } catch (err) {
        res.status(500).json({ error: "Error al obtener tu garaje" });
    }
});

// ==========================================
// RUTAS POST (Creación / Login)
// ==========================================

// 1. Registro de usuario (Encripta password)
app.post('/usuarios', async (req, res) => {
    const { nombre, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email';
        const result = await pool.query(query, [nombre, email, hashedPassword]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al crear usuario (email duplicado?)" });
    }
});

// 2. Login (Genera Token)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

        const usuario = result.rows[0];
        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) return res.status(401).json({ error: "Contraseña incorrecta" });

        const token = jwt.sign({ id: usuario.id, nombre: usuario.nombre }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ mensaje: "Login exitoso ✅", token });
    } catch (err) {
        res.status(500).json({ error: "Error en el login" });
    }
});

// 3. Registrar un coche (protegido)
app.post('/coches', autenticarToken, async (req, res) => {
    const { marca, modelo, año } = req.body;
    try {
        const query = 'INSERT INTO coches (marca, modelo, año, propietario_id) VALUES ($1, $2, $3, $4) RETURNING *';
        const result = await pool.query(query, [marca, modelo, año, req.usuario.id]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al registrar coche" });
    }
});

// ==========================================
// RUTAS DELETE (Eliminación)
// ==========================================

// 1. Eliminar coche (protegido + comprobación de dueño)
app.delete('/coches/:id', autenticarToken, async (req, res) => {
    const cocheId = req.params.id;
    try {
        const query = 'DELETE FROM coches WHERE id = $1 AND propietario_id = $2';
        const result = await pool.query(query, [cocheId, req.usuario.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Coche no encontrado o no te pertenece" });
        }
        res.json({ mensaje: "Coche eliminado correctamente 🗑️", id_eliminado: cocheId });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar coche" });
    }
});

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Clave Secreta cargada: ${SECRET_KEY ? "SÍ" : "NO"}`);
});