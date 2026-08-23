import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Decodifica el payload del JWT (id, nombre, avatar_url) solo para PINTAR
// la UI. No es una verificación de seguridad: el backend ya verificó el
// token al emitirlo y lo vuelve a verificar en cada petición autenticada.
function decodificarToken(token) {
    try {
        const payload = token.split('.')[1];
        const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return json;
    } catch (e) {
        return null;
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const datos = decodificarToken(token);
            if (datos) {
                setUser({ token, id: datos.id, nombre: datos.nombre, avatar_url: datos.avatar_url });
            } else {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/login', { email, password });
        const { token } = res.data;
        localStorage.setItem('token', token);
        const datos = decodificarToken(token);
        setUser({ token, id: datos?.id, nombre: datos?.nombre, avatar_url: datos?.avatar_url });
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    // El JWT lleva grabados nombre/avatar en el momento del login y sigue
    // siendo válido para la API aunque se editen después, así que no hace
    // falta re-loguear tras editar el perfil: esto solo actualiza lo que
    // se pinta en la UI (Navbar, etc.) con los valores nuevos.
    const actualizarPerfilLocal = ({ nombre, avatar_url }) => {
        setUser(prev => prev ? { ...prev, nombre: nombre ?? prev.nombre, avatar_url: avatar_url ?? prev.avatar_url } : prev);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, actualizarPerfilLocal }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
