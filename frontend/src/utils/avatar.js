// Devuelve la URL del avatar si existe, o null si el usuario no tiene uno
// (en ese caso el componente que lo use debe mostrar un círculo con la
// inicial, ver <Avatar/> más abajo en UserProfile.jsx / Navbar.jsx).
export function getAvatarUrl(avatar_url) {
    if (!avatar_url) return null;
    return `${import.meta.env.VITE_API_URL}${avatar_url}`;
}
