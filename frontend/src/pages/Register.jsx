import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function Register() {
    const [form, setForm] = useState({ nombre: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/usuarios', form);
            alert("Registro exitoso, ahora inicia sesión");
            navigate('/login');
        } catch (err) {
            alert("Error al registrar: ¿Email ya existe?");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
            <div className="max-w-md w-full bg-zinc-900 p-10 rounded-3xl border border-white/5 shadow-2xl">
                <h2 className="text-3xl font-black text-white mb-8 text-center italic">CREAR CUENTA</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                            placeholder="Nombre completo"
                            className="w-full bg-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-red-600"
                            onChange={e => setForm({...form, nombre: e.target.value})}
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                            type="email"
                            placeholder="Email"
                            className="w-full bg-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-red-600"
                            onChange={e => setForm({...form, email: e.target.value})}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                            type="password"
                            placeholder="Contraseña"
                            className="w-full bg-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-red-600"
                            onChange={e => setForm({...form, password: e.target.value})}
                        />
                    </div>
                    <button className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition">
                        <UserPlus size={20} /> REGISTRARSE
                    </button>
                </form>
            </div>
        </div>
    );
}