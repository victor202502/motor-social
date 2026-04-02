import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CarFront, Send } from 'lucide-react';

export default function CreatePost() {
    const [form, setForm] = useState({ marca: '', modelo: '', año: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/coches', form);
            navigate('/');
        } catch (err) {
            alert("Error saving your car.");
        }
    };

    return (
        <div className="min-h-screen pt-32 px-4 flex justify-center">
            <div className="w-full max-w-md bg-zinc-900 p-8 rounded-3xl border border-white/10">
                <div className="flex items-center gap-3 mb-8">
                    <CarFront className="text-red-600" size={32} />
                    <h2 className="text-2xl font-bold">Add to <span className="text-red-600">Garage</span></h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Brand</label>
                        <input 
                            required
                            className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-red-600 outline-none transition"
                            placeholder="e.g. Porsche"
                            onChange={e => setForm({...form, marca: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Model</label>
                        <input 
                            required
                            className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-red-600 outline-none transition"
                            placeholder="e.g. 911 GT3"
                            onChange={e => setForm({...form, modelo: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Year</label>
                        <input 
                            required
                            type="number"
                            className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-red-600 outline-none transition"
                            placeholder="2023"
                            onChange={e => setForm({...form, año: e.target.value})}
                        />
                    </div>
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 transition">
                        <Send size={18} /> PUBLISH
                    </button>
                </form>
            </div>
        </div>
    );
}