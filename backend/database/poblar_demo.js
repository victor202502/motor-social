// backend/database/poblar_demo.js
//
// Llena la base de datos con contenido de demostración: usuarios reales
// (con contraseña funcional vía bcrypt), coches, publicaciones, relaciones
// de seguimiento, likes y comentarios — para que la app se vea viva.
//
// ADITIVO Y SEGURO: solo hace INSERT. Nunca borra, ni modifica, ni toca una
// sola fila de lo que ya exista (tus 21 usuarios/11 coches reales de antes
// siguen intactos). Usa un dominio de email propio (@demo-motorsocial.com)
// para no poder chocar nunca con un email real ya existente.
//
// Uso:
//   npm run db:poblar-demo
//   (o dentro del contenedor ya construido: docker compose exec motor-app npm run db:poblar-demo)
//
// Contraseña de las 45 cuentas creadas: demo1234

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../src/db');

const DOMINIO_DEMO = '@demo-motorsocial.com';
const PASSWORD_DEMO = 'demo1234';
const N_USUARIOS = 45;

// --- Datos de partida para generar contenido variado ---
const NOMBRES_BASE = [
    'Carlos', 'Elena', 'Marc', 'Sara', 'Dani', 'Laura', 'Javier', 'Nuria', 'Pablo', 'Marta',
    'Alex', 'Cristina', 'Diego', 'Irene', 'Raul', 'Paula', 'Sergio', 'Ines', 'Victor', 'Lucia',
    'Adrian', 'Claudia', 'Ruben', 'Sofia', 'Hugo', 'Andrea', 'Manuel', 'Alba', 'Ivan', 'Rocio',
];
const TEMAS = ['Rally', 'Drift', 'Turbo', 'Track', 'Garage', 'Wheels', 'Motor', 'Racing', 'Classic', 'Tuning', 'Speed', 'JDM', 'Offroad', 'Circuit', 'GT'];

const COCHES_POOL = [
    ['BMW', 'M3'], ['Audi', 'RS4'], ['Mercedes-AMG', 'GT'], ['Volkswagen', 'Golf GTI'],
    ['Seat', 'Ibiza Cupra'], ['Toyota', 'Supra'], ['Mazda', 'MX-5'], ['Honda', 'Civic Type R'],
    ['Ford', 'Mustang'], ['Chevrolet', 'Camaro'], ['Subaru', 'Impreza WRX'], ['Mitsubishi', 'Lancer Evo'],
    ['Alfa Romeo', 'Giulia'], ['Renault', 'Megane RS'], ['Peugeot', '208 GTI'], ['Fiat', '500 Abarth'],
    ['Porsche', 'Cayman'], ['Nissan', '370Z'], ['Dodge', 'Challenger'], ['Mini', 'Cooper S'],
    ['Citroen', 'Saxo VTS'], ['Opel', 'Corsa GSI'], ['Volvo', 'C30'], ['Skoda', 'Fabia RS'],
];
const COLORES = ['Rojo', 'Negro', 'Blanco', 'Azul', 'Gris', 'Amarillo', 'Verde', 'Naranja', 'Plata'];

const BIOS = [
    'Apasionado de los motores desde siempre.', 'Los fines de semana son para la carretera.',
    'Restaurando clásicos en mi tiempo libre.', 'JDM hasta la médula.', 'Track days y café.',
    'Coleccionista de kilómetros y anécdotas.', 'Si suena bien, va bien.', 'Garaje siempre abierto.',
    '', '', '', // algunas bios vacías, para que no todo el mundo tenga una
];

const TEXTOS_PUBLICACION = [
    'Domingo de carretera con este compañero de viaje 🏁',
    'Recién salido del taller, como nuevo.',
    'Pulido de la mañana antes de la quedada de hoy.',
    'No hay nada como el sonido de este motor arrancando en frío.',
    '¿Alguien más para la quedada del sábado?',
    'Últimos retoques antes de la ITV.',
    'Cambié las llantas y quedó otro coche completamente distinto.',
    'Un año más con él, y no me cansa.',
    'Ruta de montaña este finde, fotos random.',
    'Pequeña puesta a punto para la temporada que viene.',
    'Encontré este cartel vintage a juego con el coche, no pude resistirme.',
    'Café + coches, la combinación perfecta de sábado por la mañana.',
    'Nueva incorporación al garaje, ya os cuento más.',
    'Repasando la mecánica antes del viaje largo del mes que viene.',
];

const COMENTARIOS_POOL = [
    '¡Qué pasada!', 'Menuda bestia 🔥', '¿Cuántos caballos tiene?', 'Me encanta el color',
    '¡Brutal!', 'Quiero uno igual', '¿Está en venta?', 'Impresionante acabado',
    'Se ve genial así', 'Enhorabuena por el trabajo', 'Un clásico como pocos', 'Suena de maravilla seguro',
];

// --- Utilidades ---
function aleatorio(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}
function enteroEntre(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function elegirVarios(lista, cantidad) {
    const copia = [...lista];
    const elegidos = [];
    cantidad = Math.min(cantidad, copia.length);
    for (let i = 0; i < cantidad; i++) {
        const idx = Math.floor(Math.random() * copia.length);
        elegidos.push(copia.splice(idx, 1)[0]);
    }
    return elegidos;
}

let contadorImagen = 1;
function urlImagen(categoria) {
    return `https://loremflickr.com/800/600/${categoria}/all?lock=${contadorImagen++}`;
}

// Construye un INSERT multi-fila parametrizado: sin dependencias nuevas,
// sin bucles de una petición por fila. RETURNING id opcional.
function insertMultiple(tabla, columnas, filas, conId = true) {
    const valoresSql = [];
    const params = [];
    let n = 1;
    for (const fila of filas) {
        valoresSql.push(`(${fila.map(() => `$${n++}`).join(', ')})`);
        params.push(...fila);
    }
    const sql = `INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES ${valoresSql.join(', ')}` +
        (conId ? ' RETURNING id' : ' ON CONFLICT DO NOTHING');
    return { sql, params };
}

async function ejecutarInsert(tabla, columnas, filas, conId = true) {
    if (filas.length === 0) return [];
    const { sql, params } = insertMultiple(tabla, columnas, filas, conId);
    const result = await pool.query(sql, params);
    return conId ? result.rows.map(r => r.id) : [];
}

async function yaSePobló() {
    const result = await pool.query('SELECT 1 FROM usuarios WHERE email LIKE $1 LIMIT 1', [`%${DOMINIO_DEMO}`]);
    return result.rows.length > 0;
}

async function poblar() {
    if (await yaSePobló()) {
        console.log(`Ya existen usuarios con dominio ${DOMINIO_DEMO} — no se hace nada, para no duplicar.`);
        console.log('Si quieres volver a poblar, borra antes esas cuentas a mano.');
        return;
    }

    console.log(`Generando ${N_USUARIOS} usuarios...`);
    const hash = await bcrypt.hash(PASSWORD_DEMO, 10);
    const nombresUsados = new Set();
    const filasUsuarios = [];
    while (filasUsuarios.length < N_USUARIOS) {
        const nombre = `${aleatorio(NOMBRES_BASE)}_${aleatorio(TEMAS)}`;
        if (nombresUsados.has(nombre)) continue;
        nombresUsados.add(nombre);
        const email = `${nombre.toLowerCase()}${DOMINIO_DEMO}`;
        const bio = aleatorio(BIOS);
        filasUsuarios.push([nombre, email, hash, bio, urlImagen('portrait,person')]);
    }
    const idsUsuarios = await ejecutarInsert('usuarios', ['nombre', 'email', 'password', 'bio', 'avatar_url'], filasUsuarios);
    console.log(`✓ ${idsUsuarios.length} usuarios creados`);

    console.log('Generando coches...');
    const filasCoches = [];
    const cochesPorUsuario = new Map(); // usuario_id -> [coche index en filasCoches]
    for (const uid of idsUsuarios) {
        const nCoches = enteroEntre(1, 3);
        const indices = [];
        for (let i = 0; i < nCoches; i++) {
            const [marca, modelo] = aleatorio(COCHES_POOL);
            indices.push(filasCoches.length);
            filasCoches.push([
                marca, modelo, enteroEntre(1990, 2025), uid,
                null, urlImagen(`car,${marca.toLowerCase().replace(/\s|-/g, '')}`),
                enteroEntre(90, 650), enteroEntre(0, 220000), aleatorio(COLORES),
            ]);
        }
        cochesPorUsuario.set(uid, indices);
    }
    const idsCoches = await ejecutarInsert(
        'coches',
        ['marca', 'modelo', 'año', 'propietario_id', 'descripcion', 'foto_url', 'potencia_cv', 'kilometraje', 'color'],
        filasCoches
    );
    console.log(`✓ ${idsCoches.length} coches creados`);

    console.log('Generando publicaciones...');
    const filasPublicaciones = [];
    for (const uid of idsUsuarios) {
        const nPosts = enteroEntre(0, 3);
        const misCochesIdx = cochesPorUsuario.get(uid) || [];
        for (let i = 0; i < nPosts; i++) {
            const conImagen = Math.random() < 0.7;
            const conCoche = misCochesIdx.length > 0 && Math.random() < 0.6;
            const cocheId = conCoche ? idsCoches[aleatorio(misCochesIdx)] : null;
            filasPublicaciones.push([
                uid, cocheId, aleatorio(TEXTOS_PUBLICACION),
                conImagen ? urlImagen('car') : null,
            ]);
        }
    }
    const idsPublicaciones = await ejecutarInsert(
        'publicaciones', ['usuario_id', 'coche_id', 'texto', 'imagen_url'], filasPublicaciones
    );
    console.log(`✓ ${idsPublicaciones.length} publicaciones creadas`);

    console.log('Generando seguidores...');
    const paresSeguidores = new Set();
    const filasSeguidores = [];
    for (const uid of idsUsuarios) {
        const otros = idsUsuarios.filter(id => id !== uid);
        const aSeguir = elegirVarios(otros, enteroEntre(3, 10));
        for (const seguidoId of aSeguir) {
            const clave = `${uid}-${seguidoId}`;
            if (paresSeguidores.has(clave)) continue;
            paresSeguidores.add(clave);
            filasSeguidores.push([uid, seguidoId]);
        }
    }
    await ejecutarInsert('seguidores', ['seguidor_id', 'seguido_id'], filasSeguidores, false);
    console.log(`✓ ${filasSeguidores.length} relaciones de seguimiento creadas`);

    console.log('Generando likes y comentarios en coches...');
    const filasLikesCoches = [];
    const filasComentariosCoches = [];
    for (const cocheId of idsCoches) {
        const nLikes = enteroEntre(0, Math.min(25, idsUsuarios.length));
        for (const uid of elegirVarios(idsUsuarios, nLikes)) {
            filasLikesCoches.push([uid, cocheId]);
        }
        const nComentarios = enteroEntre(0, 5);
        for (const uid of elegirVarios(idsUsuarios, nComentarios)) {
            filasComentariosCoches.push([cocheId, uid, aleatorio(COMENTARIOS_POOL)]);
        }
    }
    await ejecutarInsert('me_gusta', ['usuario_id', 'coche_id'], filasLikesCoches, false);
    await ejecutarInsert('comentarios', ['coche_id', 'usuario_id', 'contenido'], filasComentariosCoches);
    console.log(`✓ ${filasLikesCoches.length} likes y ${filasComentariosCoches.length} comentarios en coches`);

    console.log('Generando likes y comentarios en publicaciones...');
    const filasLikesPosts = [];
    const filasComentariosPosts = [];
    for (const postId of idsPublicaciones) {
        const nLikes = enteroEntre(0, Math.min(20, idsUsuarios.length));
        for (const uid of elegirVarios(idsUsuarios, nLikes)) {
            filasLikesPosts.push([uid, postId]);
        }
        const nComentarios = enteroEntre(0, 4);
        for (const uid of elegirVarios(idsUsuarios, nComentarios)) {
            filasComentariosPosts.push([postId, uid, aleatorio(COMENTARIOS_POOL)]);
        }
    }
    await ejecutarInsert('publicacion_likes', ['usuario_id', 'publicacion_id'], filasLikesPosts, false);
    await ejecutarInsert('publicacion_comentarios', ['publicacion_id', 'usuario_id', 'contenido'], filasComentariosPosts);
    console.log(`✓ ${filasLikesPosts.length} likes y ${filasComentariosPosts.length} comentarios en publicaciones`);

    console.log('\nListo. Contraseña de las cuentas nuevas: demo1234 (email: <nombre_en_minusculas>@demo-motorsocial.com)');
}

async function main() {
    try {
        await poblar();
    } catch (err) {
        console.error('Error al poblar la base de datos:', err);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    main();
}

module.exports = { poblar };
