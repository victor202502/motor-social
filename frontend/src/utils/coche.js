// Resuelve la URL de la foto de un coche: foto real subida -> URL http directa
// ya guardada (datos antiguos) -> placeholder determinista por coche (siempre
// la misma imagen para el mismo id, para que no "salte" al recargar).
export function getImagenCoche(url, id, marca = 'car') {
    if (url && !url.startsWith('http')) return `${import.meta.env.VITE_API_URL}${url}`;
    if (url && url.startsWith('http')) return url;
    return `https://loremflickr.com/800/600/${marca.toLowerCase()},car/all?lock=${id}`;
}
