import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, User, LogOut, PlusCircle } from 'lucide-react';

const API_URL = "http://192.168.0.6:3000"; // Cambia esto por tu IP si cambia

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [email, setEmail] = useState('sir_lewis@mercedes.com');
  const [password, setPassword] = useState('password123');
  const [coches, setCoches] = useState([]);

  // Cargar coches al iniciar
  useEffect(() => {
    fetchCoches();
  }, []);

  const fetchCoches = async () => {
    const res = await axios.get(`${API_URL}/coches-detallados`);
    setCoches(res.data);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      alert("Login exitoso ✅");
    } catch (err) {
      alert("Error en el login");
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
        <h1>🏎️ Motor Social</h1>
        {token ? (
          <button onClick={handleLogout} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>
            <LogOut size={16} /> Salir
          </button>
        ) : (
          <form onSubmit={handleLogin}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button type="submit">Entrar</button>
          </form>
        )}
      </header>

      <main style={{ marginTop: '20px' }}>
        <h2>Muro de Coches</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {coches.map(c => (
            <div key={c.id} style={{ background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <Car size={40} color="#333" />
              <h3>{c.marca} {c.modelo}</h3>
              <p>📅 Año: {c.año}</p>
              <p style={{ color: '#666', fontSize: '0.9em' }}>👤 Propietario: <strong>{c.nombre_propietario}</strong></p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;