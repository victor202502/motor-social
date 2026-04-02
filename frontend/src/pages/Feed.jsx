import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Gauge, Calendar, User as UserIcon, MessageCircle, Heart } from 'lucide-react';

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/coches-detallados')
            .then(res => setPosts(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-screen bg-zinc-950 flex items-center justify-center text-white">Loading Engine...</div>;

    return (
        <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-bold text-white tracking-tight">Global <span className="text-red-600">Garage</span></h1>
                <p className="text-zinc-500">Explore the latest builds from the community.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((car, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={car.id} 
                        className="group bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300 shadow-2xl"
                    >
                        {/* Car Image Placeholder */}
                        <div className="relative h-64 bg-zinc-800 overflow-hidden">
                            <img 
                                src={`https://source.unsplash.com/featured/?${car.marca},${car.modelo}`} 
                                alt={car.modelo}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest border border-white/10">
                                {car.marca}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-1 uppercase italic">{car.modelo}</h3>
                            
                            <div className="flex gap-4 mb-6 mt-4 text-zinc-400 text-sm">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} className="text-red-600" /> {car.año}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Gauge size={14} className="text-red-600" /> Stock
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                                        <UserIcon size={14} />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-300">{car.nombre_propietario}</span>
                                </div>
                                <div className="flex gap-3 text-zinc-500">
                                    <Heart size={20} className="hover:text-red-500 cursor-pointer transition" />
                                    <MessageCircle size={20} className="hover:text-blue-500 cursor-pointer transition" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}