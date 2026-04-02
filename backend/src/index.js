require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer'); // <--- Para las fotos
const path = require('path');
const fs = require('fs');
const pool = require('./db');

const app = express();

// --- CONFIGURACIÓN DE SUBIDA DE FOTOS ---
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // <--- Para que las fotos sean visibles

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;

const autenticarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "No hay token" });

    jwt.verify(token, SECRET_KEY, (err, usuario) => {
        if (err) return res.status(403).json({ error: "Token no válido" });
        req.usuario = usuario;
        next();
    });
};

// --- RUTA: CREAR COCHE (CON FOTO Y DESCRIPCIÓN) ---
app.post('/coches', autenticarToken, upload.single('foto'), async (req, res) => {
    const { marca, modelo, año, descripcion } = req.body;
    // Si hay foto, guardamos la ruta. Si no, queda en null.
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const query = `
            INSERT INTO coches (marca, modelo, año, propietario_id, descripcion, foto_url) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const values = [marca, modelo, año, req.usuario.id, descripcion, foto_url];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al guardar el coche" });
    }
});

// --- RUTA: LOGIN ---
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });
        const valid = await bcrypt.compare(password, result.rows[0].password);
        if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });
        const token = jwt.sign({ id: result.rows[0].id, nombre: result.rows[0].nombre }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token });
    } catch (err) { res.status(500).json({ error: "Error" }); }
});

// --- RUTA: VER TODOS LOS COCHES ---
app.get('/coches-detallados', async (req, res) => {
    try {
        const query = `
            SELECT coches.*, usuarios.nombre as nombre_propietario 
            FROM coches 
            JOIN usuarios ON coches.propietario_id = usuarios.id
            ORDER BY coches.id DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: "Error al obtener coches" }); }
});

// --- RUTA: VER MIS COCHES ---
app.get('/mis-coches', autenticarToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM coches WHERE propietario_id = $1 ORDER BY id DESC', [req.usuario.id]);
        res.json({ garaje: result.rows });
    } catch (err) { res.status(500).json({ error: "Error" }); }
});

// --- RUTA: LIKE ---
app.post('/coches/:id/like', autenticarToken, async (req, res) => {
    try {
        const check = await pool.query('SELECT * FROM me_gusta WHERE usuario_id = $1 AND coche_id = $2', [req.usuario.id, req.params.id]);
        if (check.rows.length > 0) {
            await pool.query('DELETE FROM me_gusta WHERE usuario_id = $1 AND coche_id = $2', [req.usuario.id, req.params.id]);
        } else {
            await pool.query('INSERT INTO me_gusta (usuario_id, coche_id) VALUES ($1, $2)', [req.usuario.id, req.params.id]);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Error" }); }
});

// --- RUTA: REGISTRO ---
app.post('/usuarios', async (req, res) => {
    const { nombre, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query('INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email', [nombre, email, hashed]);
    res.json(result.rows[0]);
});

app.listen(PORT, () => console.log(`Servidor rugiendo en el puerto ${PORT}`));