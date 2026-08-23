import { useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { CarFront, Send, Camera } from 'lucide-react';

// coche: si se pasa, es modo edición (prellena los campos y usa PUT).
// Si no se pasa, es modo creación (POST). onGuardado recibe el coche resultante.
export default function CocheForm({ coche = null, onGuardado }) {
    const esEdicion = !!coche;
    const { mostrarToast } = useToast();
    const [form, setForm] = useState({
        marca: coche?.marca || '',
        modelo: coche?.modelo || '',
        año: coche?.año || '',
        descripcion: coche?.descripcion || '',
        potencia_cv: coche?.potencia_cv || '',
        kilometraje: coche?.kilometraje || '',
        color: coche?.color || '',
    });
    const [foto, setFoto] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const campo = (key, label, props = {}) => (
        <div>
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">{label}</label>
            <input
                value={form[key]}
                className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-red-600 outline-none transition"
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                {...props}
            />
        </div>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value) formData.append(key, value);
            });
            if (foto) formData.append('foto', foto);

            const res = esEdicion
                ? await api.put(`/coches/${coche.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                : await api.post('/coches', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

            onGuardado(res.data);
            mostrarToast(esEdicion ? "Coche actualizado" : "Coche publicado", "exito");
        } catch (err) {
            mostrarToast(err.response?.data?.error || "Error al guardar el coche", "error");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-white/10 h-fit">
            <div className="flex items-center gap-3 mb-8">
                <CarFront className="text-red-600" size={32} />
                <h2 className="text-2xl font-bold text-white">
                    {esEdicion ? <>Editar <span className="text-red-600">Coche</span></> : <>Añadir al <span className="text-red-600">Garaje</span></>}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    {campo('marca', 'Marca', { required: true, placeholder: 'Ej. Porsche' })}
                    {campo('modelo', 'Modelo', { required: true, placeholder: 'Ej. 911 GT3' })}
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {campo('año', 'Año', { type: 'number', placeholder: '2023' })}
                    {campo('potencia_cv', 'CV', { type: 'number', placeholder: '450' })}
                    {campo('color', 'Color', { placeholder: 'Rojo' })}
                </div>
                {campo('kilometraje', 'Kilometraje (km)', { type: 'number', placeholder: '45000' })}
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Descripción</label>
                    <textarea
                        value={form.descripcion}
                        className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-red-600 outline-none transition h-24 resize-none"
                        placeholder="Detalles técnicos, historia, preparación..."
                        onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    />
                </div>
                <div className="relative bg-zinc-800 p-6 rounded-xl border-2 border-dashed border-zinc-700 text-center">
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFoto(e.target.files[0])} />
                    <Camera className="mx-auto mb-2 text-zinc-500" size={28} />
                    <p className="text-xs text-zinc-500">
                        {foto ? foto.name : (esEdicion ? "Cambiar foto principal (opcional)" : "Subir fotografía (opcional)")}
                    </p>
                </div>
                <button type="submit" disabled={enviando} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 transition">
                    <Send size={18} /> {enviando ? "Guardando..." : (esEdicion ? "Guardar cambios" : "Publicar")}
                </button>
            </form>
        </div>
    );
}
