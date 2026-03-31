const express = require('express');
const pool = require('./db');
const app = express();
const PORT = 3000;
const bcrypt = require('bcrypt'); // <--- 1. Importar bcrypt
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET; // Usar la del archivo .env

app.use(express.json());

// --- MIDDLEWARE DE AUTENTICACIÓN ---
const autenticarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) return res.status(401).json({ error: "No hay token, acceso denegado" });

    jwt.verify(token, SECRET_KEY, (err, usuario) => {
        if (err) return res.status(403).json({ error: "Token no válido o expirado" });
        req.usuario = usuario; // Guardamos los datos del usuario en la petición
        next(); // Continuamos a la ruta
    });
};

// Ruta de prueba: Obtener usuarios de la base de datos
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/', (req, res) => {
  res.send('API con Auto-Reload funcionando! 🚀');
});

// Ruta para CREAR un nuevo usuario
app.post('/usuarios', async (req, res) => {
    const { nombre, email, password } = req.body;
    
    try {
        // 2. Encriptar la contraseña (10 es el nivel de seguridad)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Guardar la contraseña encriptada (hashedPassword)
        const query = 'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email';
        const values = [nombre, email, hashedPassword];
        
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear usuario" });
    }
});

// Ruta para registrar un coche vinculado a un usuario
// Ahora usamos 'autenticarToken' antes de la función final
app.post('/coches', autenticarToken, async (req, res) => {
    const { marca, modelo, año } = req.body;
    const propietario_id = req.usuario.id; // Extraído directamente del Token

    try {
        const query = 'INSERT INTO coches (marca, modelo, año, propietario_id) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [marca, modelo, año, propietario_id];
        const result = await pool.query(query, values);
        
        res.status(201).json({
            mensaje: "Coche registrado por " + req.usuario.nombre,
            coche: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: "Error al registrar coche" });
    }
});

// Ruta para ver todos los coches con los datos de su dueño (JOIN)
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
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});
// RUTA DE LOGIN
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar el usuario
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        const usuario = result.rows[0];

        // 2. Comparar contraseña encriptada
        const validPassword = await bcrypt.compare(password, usuario.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // 3. Generar el Token (JWT)
        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre }, 
            SECRET_KEY, 
            { expiresIn: '2h' }
        );

        res.json({
            mensaje: "Login exitoso ✅",
            token: token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en el login" });
    }
});

// Ver solo los coches del usuario logueado
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

app.delete('/coches/:id', autenticarToken, async (req, res) => {
    const cocheId = req.params.id; // El ID que viene en la URL
    const usuarioId = req.usuario.id; // El ID que viene del Token

    try {
        // IMPORTANTE: Solo borra si el ID del coche coincide Y el dueño es quien dice ser
        const query = 'DELETE FROM coches WHERE id = $1 AND propietario_id = $2';
        const result = await pool.query(query, [cocheId, usuarioId]);

        if (result.rowCount === 0) {
            // Si no borró nada, es porque el coche no existe o no es de este usuario
            return res.status(404).json({ 
                error: "No se encontró el coche o no tienes permiso para borrarlo" 
            });
        }

        res.json({
            mensaje: "Coche eliminado correctamente 🗑️",
            id_eliminado: cocheId
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al intentar eliminar el coche" });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});