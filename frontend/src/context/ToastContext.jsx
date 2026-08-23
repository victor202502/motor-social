import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const mostrarToast = useCallback((mensaje, tipo = 'error') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ mostrarToast }}>
            {children}
            <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 sm:max-w-sm sm:w-full pointer-events-none">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md bg-zinc-900/95 text-white ${t.tipo === 'exito' ? 'border-green-600/40' : 'border-red-600/40'
                                }`}
                        >
                            {t.tipo === 'exito'
                                ? <CheckCircle size={18} className="text-green-500 shrink-0" />
                                : <XCircle size={18} className="text-red-500 shrink-0" />}
                            <span className="text-sm">{t.mensaje}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
