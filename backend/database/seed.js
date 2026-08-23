// backend/database/seed.js
//
// Datos de ejemplo para una instalación NUEVA (base de datos recién creada
// y vacía). Es una acción explícita (npm run db:seed), nunca automática, y
// nunca se ejecuta sobre una base que ya tenga datos: si la tabla usuarios
// ya tiene filas, se detiene sin tocar nada, para no duplicar ni mezclarse
// con datos reales.
//
// Uso:
//   npm run db:migrate   (primero, siempre)
//   npm run db:seed      (opcional, solo en una instalación nueva)

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../src/db');

const USUARIOS_DEMO = [
    { nombre: 'Demo_Rally', email: 'demo1@motorsocial.local', password: 'demo1234' },
    { nombre: 'Demo_Clasicos', email: 'demo2@motorsocial.local', password: 'demo1234' },
    { nombre: 'Demo_JDM', email: 'demo3@motorsocial.local', password: 'demo1234' },
];

const COCHES_DEMO = [
    { marca: 'Renault', modelo: '5 Turbo', año: 1985, descripcion: 'Icono del rally de Grupo B.', duenoIdx: 0 },
    { marca: 'Porsche', modelo: '911 (964)', año: 1991, descripcion: 'Restaurado íntegramente en 2023.', duenoIdx: 1 },
    { marca: 'Nissan', modelo: 'Skyline GT-R R34', año: 1999, descripcion: 'Preparación ligera de escape y suspensión.', duenoIdx: 2 },
];

async function yaHayDatos() {
    const result = await pool.query('SELECT COUNT(*) FROM usuarios');
    return parseInt(result.rows[0].count, 10) > 0;
}

async function seed() {
    if (await yaHayDatos()) {
        console.log('La tabla usuarios ya tiene datos — no se hace nada, para no duplicar ni mezclar con datos reales.');
        console.log('El seed solo está pensado para una base de datos recién creada y vacía.');
        return;
    }

    console.log('Base de datos vacía detectada. Insertando datos de demo...');

    const idsUsuarios = [];
    for (const u of USUARIOS_DEMO) {
        const hash = await bcrypt.hash(u.password, 10);
        const result = await pool.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id',
            [u.nombre, u.email, hash]
        );
        idsUsuarios.push(result.rows[0].id);
    }

    for (const c of COCHES_DEMO) {
        await pool.query(
            'INSERT INTO coches (marca, modelo, año, propietario_id, descripcion) VALUES ($1, $2, $3, $4, $5)',
            [c.marca, c.modelo, c.año, idsUsuarios[c.duenoIdx], c.descripcion]
        );
    }

    console.log(`Insertados ${USUARIOS_DEMO.length} usuarios y ${COCHES_DEMO.length} coches de demo.`);
    console.log('Contraseña de todos los usuarios demo: demo1234');
}

async function main() {
    try {
        await seed();
    } catch (err) {
        console.error('Error al insertar los datos de demo:', err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    main();
}

module.exports = { seed };
