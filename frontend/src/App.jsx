import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, LogOut, Gauge, Heart, PlusCircle, Globe, LayoutGrid, Camera, X, MessageSquare, Send, LogIn } from 'lucide-react';

const API_URL = "http://192.168.0.6:3000";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [coches, setCoches] = useState([]);
  const [tab, setTab] = useState('global'); 
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false); 
  const [authMode, setAuthMode] = useState('login'); 
  const [selectedCar, setSelectedCar] = useState(null); 
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  
  const [authData, setAuthData] = useState({ nombre: '', email: '', password: '' });
  const [nuevoCoche, setNuevoCoche] = useState({ marca: '', modelo: '', año: 2024, descripcion: '', foto: null });

  useEffect(() => { fetchData(); }, [tab, token]);

  const fetchData = async () => {
    try {
      const url = tab === 'global' ? `${API_URL}/coches-detallados` : `${API_URL}/mis-coches`;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get(url, config);
      setCoches(tab === 'global' ? res.data : res.data.garaje);
    } catch (err) { console.error(err); }
  };

  // --- FUNCIÓN DE IMÁGENES CORREGIDA ---
  const getImagenCoche = (url, id, marca = 'car') => {
    // 1. Si hay una foto real subida al servidor
    if (url && !url.startsWith('http')) return `${API_URL}${url}`;
    
    // 2. Si hay una URL de Unsplash vieja en la DB (las que metimos por SQL), 
    // la ignoramos porque Unsplash Source ya no va bien, o la dejamos si es URL directa.
    if (url && url.startsWith('http')) return url;

    // 3. Placeholder dinámico usando LoremFlickr (Mucho más fiable que Unsplash)
    // Usamos 'lock' con el ID del coche para que la foto sea SIEMPRE la misma para ese coche pero distinta de los demás
    return `https://loremflickr.com/800/600/${marca.toLowerCase()},car/all?lock=${id}`;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = authMode === 'login' ? '/login' : '/usuarios';
      const res = await axios.post(`${API_URL}${endpoint}`, authData);
      if (authMode === 'login') {
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        setShowAuthModal(false);
      } else {
        alert("¡Registro completado! Ya puedes entrar.");
        setAuthMode('login');
      }
    } catch (err) { alert(err.response?.data?.error || "Error"); }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setTab('global');
    setSelectedCar(null);
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(nuevoCoche).forEach(key => {
      if (nuevoCoche[key]) formData.append(key, nuevoCoche[key]);
    });
    try {
      await axios.post(`${API_URL}/coches`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setShowModalAdd(false);
      fetchData();
    } catch (err) { alert("Error al subir"); }
  };

  const handleLike = async (e, id) => {
    if (e) e.stopPropagation();
    if (!token) return alert("Loguéate primero 🏎️");
    try {
      const res = await axios.post(`${API_URL}/coches/${id}/like`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchData();
      if (selectedCar && selectedCar.id === id) {
        const liked = res.data.liked;
        const currentLikes = parseInt(selectedCar.total_likes);
        setSelectedCar({
          ...selectedCar,
          total_likes: liked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
          user_liked: liked
        });
      }
    } catch (err) { console.error(err); }
  };

  const openDetail = async (coche) => {
    setSelectedCar(coche);
    const res = await axios.get(`${API_URL}/coches/${coche.id}/comentarios`);
    setComments(res.data);
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/coches/${selectedCar.id}/comentarios`, 
        { contenido: newComment }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, { ...res.data, autor: "Tú" }]);
      setNewComment("");
    } catch (err) { alert("Error"); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* NAVBAR */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab('global')}>
            <div className="bg-red-600 p-1.5 rounded-lg"><Car size={20} className="text-white" /></div>
            <span className="text-lg font-black tracking-tighter uppercase italic">Motor<span className="text-red-500">Social</span></span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setTab('global')} className={`text-xs font-black tracking-widest ${tab === 'global' ? 'text-red-500' : 'text-slate-400'}`}>GLOBAL</button>
            {token ? (
              <div className="flex items-center gap-4">
                <button onClick={() => setTab('mis-coches')} className={`text-xs font-black tracking-widest ${tab === 'mis-coches' ? 'text-red-500' : 'text-slate-400'}`}>MI GARAJE</button>
                <button onClick={() => setShowModalAdd(true)} className="bg-red-600 p-2 rounded-full"><PlusCircle size={20} /></button>
                <button onClick={handleLogout} className="text-slate-500 hover:text-white"><LogOut size={20} /></button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="text-[10px] font-black uppercase tracking-widest bg-slate-800 px-4 py-2 rounded-full">Entrar / Registro</button>
            )}
          </div>
        </div>
      </nav>

      {/* MURO */}
      <main className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {coches.map(c => (
          <div key={c.id} onClick={() => openDetail(c)} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden cursor-pointer hover:border-slate-600 transition-all group shadow-xl">
            <div className="relative h-64 overflow-hidden bg-black">
                <img 
                  src={getImagenCoche(c.foto_url, c.id, c.marca)} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                  alt={c.modelo} 
                />
                <div className="absolute top-4 left-4 bg-black/60 px-2 py-1 rounded text-[10px] font-bold uppercase">{c.año}</div>
            </div>
            <div className="p-6 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{c.marca}</p>
                <h3 className="text-xl font-black italic uppercase">{c.modelo}</h3>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <div className="flex items-center gap-1.5" onClick={(e) => handleLike(e, c.id)}>
                    <Heart size={20} className={c.user_liked ? 'text-red-500 fill-red-500' : 'hover:text-red-500'} /> 
                    <span className="text-xs font-bold">{c.total_likes}</span>
                </div>
                <MessageSquare size={20} />
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* MODAL DETALLE */}
      {selectedCar && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4">
          <button onClick={() => setSelectedCar(null)} className="absolute top-6 right-6 text-white"><X size={32} /></button>
          <div className="bg-slate-900 w-full max-w-5xl h-[85vh] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border border-slate-800">
            <div className="flex-[1.5] bg-black flex items-center justify-center p-4">
              <img 
                src={getImagenCoche(selectedCar.foto_url, selectedCar.id, selectedCar.marca)} 
                className="max-h-full max-w-full object-contain rounded-xl" 
                alt="" 
              />
            </div>
            <div className="flex-1 flex flex-col border-l border-slate-800">
              <div className="p-8 border-b border-slate-800">
                <p className="text-red-500 text-[10px] font-black uppercase mb-2">{selectedCar.marca}</p>
                <h2 className="text-3xl font-black italic uppercase leading-none mb-4">{selectedCar.modelo}</h2>
                <p className="text-slate-400 text-sm italic border-l-2 border-red-600 pl-4">"{selectedCar.descripcion || 'Sin descripción.'}"</p>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {comments.map(com => (
                  <div key={com.id} className="text-sm bg-slate-800/30 p-3 rounded-2xl">
                    <span className="font-black text-red-500 mr-2 uppercase text-[10px]">{com.autor}:</span>
                    <span className="text-slate-300">{com.contenido}</span>
                  </div>
                ))}
              </div>
              <div className="p-8 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-4 mb-6">
                    <Heart onClick={(e) => handleLike(e, selectedCar.id)} size={28} className={`cursor-pointer ${selectedCar.user_liked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                    <span className="text-xs font-black uppercase">{selectedCar.total_likes} Likes</span>
                </div>
                {token ? (
                    <form onSubmit={postComment} className="flex gap-2">
                        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Comentar..." className="flex-1 bg-slate-800 rounded-2xl px-5 py-3 text-sm focus:outline-none" />
                        <button type="submit" className="bg-red-600 p-3 rounded-2xl"><Send size={18} /></button>
                    </form>
                ) : <p className="text-[10px] text-slate-600 text-center uppercase italic font-black">Identifícate para comentar</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AUTH */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-md p-10 rounded-[3rem] border border-slate-800 relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-8 right-8 text-slate-500"><X size={24} /></button>
            <div className="flex justify-center gap-10 mb-10 border-b border-slate-800 pb-4">
              <button onClick={() => setAuthMode('login')} className={`text-xs font-black uppercase ${authMode === 'login' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-500'}`}>ENTRAR</button>
              <button onClick={() => setAuthMode('register')} className={`text-xs font-black uppercase ${authMode === 'register' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-500'}`}>REGISTRO</button>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && ( <input type="text" placeholder="Nombre" className="w-full bg-slate-800 rounded-2xl p-5 text-sm outline-none" onChange={e => setAuthData({...authData, nombre: e.target.value})} required /> )}
              <input type="email" placeholder="Email" className="w-full bg-slate-800 rounded-2xl p-5 text-sm outline-none" onChange={e => setAuthData({...authData, email: e.target.value})} required />
              <input type="password" placeholder="Password" className="w-full bg-slate-800 rounded-2xl p-5 text-sm outline-none" onChange={e => setAuthData({...authData, password: e.target.value})} required />
              <button type="submit" className="w-full bg-red-600 py-5 rounded-2xl font-black text-xs uppercase tracking-widest mt-6 italic">Arrancar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AÑADIR */}
      {showModalAdd && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 p-10 rounded-[3rem] w-full max-w-lg border border-slate-800 relative shadow-2xl">
             <button onClick={() => setShowModalAdd(false)} className="absolute top-8 right-8 text-slate-500"><X size={24} /></button>
             <h2 className="text-3xl font-black mb-10 uppercase italic">Nueva Publicación</h2>
             <form onSubmit={handleAddCar} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Marca" className="w-full bg-slate-800 p-4 rounded-2xl text-sm" onChange={e => setNuevoCoche({...nuevoCoche, marca: e.target.value})} required />
                    <input type="text" placeholder="Modelo" className="w-full bg-slate-800 p-4 rounded-2xl text-sm" onChange={e => setNuevoCoche({...nuevoCoche, modelo: e.target.value})} required />
                </div>
                <input type="number" placeholder="Año" className="w-full bg-slate-800 p-4 rounded-2xl text-sm" onChange={e => setNuevoCoche({...nuevoCoche, año: e.target.value})} required />
                <textarea placeholder="Descripción técnica..." className="w-full bg-slate-800 p-4 rounded-2xl text-sm h-32 resize-none" onChange={e => setNuevoCoche({...nuevoCoche, descripcion: e.target.value})} />
                <div className="relative bg-slate-800 p-8 rounded-2xl border-2 border-dashed border-slate-700 text-center">
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setNuevoCoche({...nuevoCoche, foto: e.target.files[0]})} />
                    <Camera className="mx-auto mb-2 text-slate-500" size={40} />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{nuevoCoche.foto ? nuevoCoche.foto.name : "Subir Fotografía"}</p>
                </div>
                <button type="submit" className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest mt-6">Publicar Ficha</button>
             </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;