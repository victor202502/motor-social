require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('./db');

const app = express();

// --- CONFIGURACIÓN DE FOTOS ---
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;

const autenticarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "No hay token" });

    jwt.verify(token, SECRET_KEY, (err, usuario) => {
        if (err) return res.status(403).json({ error: "Token inválido" });
        req.usuario = usuario;
        next();
    });
};

// --- RUTAS DE USUARIOS ---
app.post('/usuarios', async (req, res) => {
    const { nombre, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query('INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email', [nombre, email, hashed]);
    res.json(result.rows[0]);
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });
    const valid = await bcrypt.compare(password, result.rows[0].password);
    if (!valid) return res.status(401).json({ error: "Password incorrecta" });
    const token = jwt.sign({ id: result.rows[0].id, nombre: result.rows[0].nombre }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token });
});

// --- RUTAS DE COCHES ---
app.get('/coches-detallados', async (req, res) => {
    try {
        const query = `
            SELECT coches.*, usuarios.nombre as nombre_propietario,
            (SELECT COUNT(*) FROM me_gusta WHERE coche_id = coches.id) as total_likes
            FROM coches 
            JOIN usuarios ON coches.propietario_id = usuarios.id
            ORDER BY coches.id DESC`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/mis-coches', autenticarToken, async (req, res) => {
    const result = await pool.query('SELECT * FROM coches WHERE propietario_id = $1 ORDER BY id DESC', [req.usuario.id]);
    res.json({ garaje: result.rows });
});

app.post('/coches', autenticarToken, upload.single('foto'), async (req, res) => {
    const { marca, modelo, año, descripcion } = req.body;
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;
    const query = `INSERT INTO coches (marca, modelo, año, propietario_id, descripcion, foto_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const result = await pool.query(query, [marca, modelo, año, req.usuario.id, descripcion, foto_url]);
    res.status(201).json(result.rows[0]);
});

// --- LIKES Y COMENTARIOS ---
// BUSCA ESTA RUTA Y REEMPLÁZALA
app.post('/coches/:id/like', autenticarToken, async (req, res) => {
    try {
        const check = await pool.query('SELECT * FROM me_gusta WHERE usuario_id = $1 AND coche_id = $2', [req.usuario.id, req.params.id]);
        let liked = false;
        
        if (check.rows.length > 0) {
            await pool.query('DELETE FROM me_gusta WHERE usuario_id = $1 AND coche_id = $2', [req.usuario.id, req.params.id]);
            liked = false;
        } else {
            await pool.query('INSERT INTO me_gusta (usuario_id, coche_id) VALUES ($1, $2)', [req.usuario.id, req.params.id]);
            liked = true;
        }
        
        // Devolvemos el estado actual para que el Front se entere
        res.json({ success: true, liked: liked });
    } catch (err) { res.status(500).json({ error: "Error" }); }
});

app.get('/coches/:id/comentarios', async (req, res) => {
    const query = `
        SELECT comentarios.*, usuarios.nombre as autor 
        FROM comentarios 
        JOIN usuarios ON comentarios.usuario_id = usuarios.id 
        WHERE coche_id = $1 ORDER BY fecha_registro ASC`;
    const result = await pool.query(query, [req.params.id]);
    res.json(result.rows);
});

app.post('/coches/:id/comentarios', autenticarToken, async (req, res) => {
    const { contenido } = req.body;
    const query = `INSERT INTO comentarios (coche_id, usuario_id, contenido) VALUES ($1, $2, $3) RETURNING *`;
    const result = await pool.query(query, [req.params.id, req.usuario.id, contenido]);
    res.json(result.rows[0]);
});

app.listen(PORT, () => console.log(`Servidor rugiendo en el puerto ${PORT}`));