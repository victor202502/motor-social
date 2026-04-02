import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, User, LogOut, PlusSquare, LogIn } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2 italic">
                <div className="bg-red-600 p-1 rounded-sm">
                    <Car size={24} color="white" />
                </div>
                MOTOR<span className="text-red-600 font-light">SOCIAL</span>
            </Link>

            <div className="flex items-center gap-6">
                {user ? (
                    <>
                        <Link to="/create" className="hover:text-red-500 transition-colors"><PlusSquare /></Link>
                        <Link to="/profile" className="hover:text-red-500 transition-colors"><User /></Link>
                        <button onClick={() => { logout(); navigate('/'); }} className="text-zinc-400 hover:text-white">
                            <LogOut size={20} />
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:bg-zinc-200 transition">
                        <LogIn size={16} /> LOGIN
                    </Link>
                )}
            </div>
        </nav>
    );
}