import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, LogOut, Gauge, Heart, PlusCircle, Globe, LayoutGrid, Camera, X } from 'lucide-react';

const API_URL = "http://192.168.0.6:3000";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [coches, setCoches] = useState([]);
  const [tab, setTab] = useState('global'); 
  const [showModal, setShowModal] = useState(false);
  
  // Estado del formulario actualizado con foto y descripción
  const [nuevoCoche, setNuevoCoche] = useState({ 
    marca: '', 
    modelo: '', 
    año: 2024, 
    descripcion: '', 
    foto: null 
  });

  useEffect(() => {
    fetchData();
  }, [tab, token]);

  const fetchData = async () => {
    try {
      const url = tab === 'global' ? `${API_URL}/coches-detallados` : `${API_URL}/mis-coches`;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get(url, config);
      setCoches(tab === 'global' ? res.data : res.data.garaje);
    } catch (err) { console.error(err); }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    
    // IMPORTANTE: Para enviar archivos usamos FormData
    const formData = new FormData();
    formData.append('marca', nuevoCoche.marca);
    formData.append('modelo', nuevoCoche.modelo);
    formData.append('año', nuevoCoche.año);
    formData.append('descripcion', nuevoCoche.descripcion);
    if (nuevoCoche.foto) {
      formData.append('foto', nuevoCoche.foto);
    }

    try {
      await axios.post(`${API_URL}/coches`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
      setShowModal(false);
      setNuevoCoche({ marca: '', modelo: '', año: 2024, descripcion: '', foto: null }); // Limpiar
      fetchData();
    } catch (err) { 
      alert("Error al subir el coche. Revisa que el backend acepte archivos."); 
    }
  };

  const handleLike = async (id) => {
    if (!token) return alert("Debes estar logueado para dar Like");
    try {
      await axios.post(`${API_URL}/coches/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* NAVBAR */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab('global')}>
            <div className="bg-red-600 p-1.5 rounded-lg"><Car size={24} className="text-white" /></div>
            <span className="text-xl font-black tracking-tighter uppercase">Motor<span className="text-red-500">Social</span></span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setTab('global')} className={`flex items-center gap-2 text-sm font-bold ${tab === 'global' ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}>
              <Globe size={18} /> GLOBAL
            </button>
            {token && (
              <>
                <button onClick={() => setTab('mis-coches')} className={`flex items-center gap-2 text-sm font-bold ${tab === 'mis-coches' ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}>
                  <LayoutGrid size={18} /> MI GARAJE
                </button>
                <button onClick={() => setShowModal(true)} className="bg-red-600 hover:bg-red-700 p-2 rounded-full transition-transform hover:scale-110 shadow-lg shadow-red-600/20">
                  <PlusCircle size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <header className="py-12 text-center">
        <h1 className="text-5xl font-black uppercase tracking-tighter italic">
          {tab === 'global' ? 'Global Garage' : 'Mi Garaje Personal'}
        </h1>
        <p className="text-slate-400 mt-2 font-medium">{tab === 'global' ? 'Las mejores máquinas de la red' : 'Tus proyectos y piezas'}</p>
      </header>

      {/* GRID DE COCHES */}
      <main className="max-w-7xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {coches.map(c => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl group transition-all hover:border-slate-600">
            {/* LOGICA DE IMAGEN: Si hay foto_url usa el servidor, si no, Unsplash */}
            <div className="relative h-56">
              <img 
                src={c.foto_url ? `${API_URL}${c.foto_url}` : `https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt={c.modelo} 
              />
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                {c.año}
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-2xl font-black italic uppercase leading-none">{c.modelo}</h3>
                  <p className="text-red-500 text-xs font-black uppercase tracking-[0.2em] mt-1">{c.marca}</p>
                </div>
                <button onClick={() => handleLike(c.id)} className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors group/like">
                  <Heart size={22} className="group-hover/like:fill-red-500" />
                </button>
              </div>

              {/* Mostrar descripción si existe */}
              {c.descripcion && (
                <p className="text-slate-400 text-sm mt-3 mb-4 line-clamp-2 italic leading-relaxed">
                  "{c.descripcion}"
                </p>
              )}

              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold pt-4 border-t border-slate-800/50">
                <Gauge size={14} className="text-red-500" /> 
                <span className="uppercase tracking-widest">Owner:</span> 
                <span className="text-slate-300 underline decoration-red-500/50">{c.nombre_propietario || 'Tú'}</span>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* MODAL PARA AÑADIR COCHE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white">
              <X size={24} />
            </button>
            
            <h2 className="text-3xl font-black mb-8 uppercase italic tracking-tighter">Nueva Ficha <span className="text-red-500">Técnica</span></h2>
            
            <form onSubmit={handleAddCar} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Marca</label>
                  <input type="text" placeholder="Porsche" className="w-full bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-red-500 transition-all" 
                    onChange={e => setNuevoCoche({...nuevoCoche, marca: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Modelo</label>
                  <input type="text" placeholder="911 GT3" className="w-full bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-red-500 transition-all" 
                    onChange={e => setNuevoCoche({...nuevoCoche, modelo: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Año</label>
                <input type="number" placeholder="2024" className="w-full bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-red-500 transition-all" 
                  onChange={e => setNuevoCoche({...nuevoCoche, año: e.target.value})} required />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Descripción / Mods</label>
                <textarea placeholder="Ej: Llantas BBS, escape de titanio, Stage 1..." className="w-full bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-red-500 transition-all h-24 resize-none" 
                  onChange={e => setNuevoCoche({...nuevoCoche, descripcion: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Fotografía</label>
                <div className="relative group">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={e => setNuevoCoche({...nuevoCoche, foto: e.target.files[0]})} />
                  <div className="w-full bg-slate-800 border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center group-hover:border-red-500/50 transition-all">
                    <Camera className="mx-auto mb-2 text-slate-500 group-hover:text-red-500" size={32} />
                    <p className="text-xs text-slate-400 font-bold uppercase">
                      {nuevoCoche.foto ? nuevoCoche.foto.name : "Seleccionar Archivo"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="submit" className="flex-[2] bg-red-600 hover:bg-red-700 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-red-600/20">
                  PUBLICAR
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;