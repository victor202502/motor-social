import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import CarDetail from './pages/CarDetail';
import CreatePost from './pages/CreatePost';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import EditCar from './pages/EditCar';
import FollowList from './pages/FollowList';
import PostFeed from './pages/PostFeed';
import PostDetail from './pages/PostDetail';
import NuevaPublicacion from './pages/NuevaPublicacion';
import EditPost from './pages/EditPost';
import Notifications from './pages/Notifications';
import Discover from './pages/Discover';

function RutaPrivada({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function App() {
    return (
        <div className="min-h-screen bg-zinc-950 text-slate-100 font-sans">
            <Navbar />
            <Routes>
                <Route path="/" element={<Feed mode="global" />} />
                <Route path="/garaje" element={<RutaPrivada><Feed mode="mine" /></RutaPrivada>} />
                <Route path="/siguiendo" element={<RutaPrivada><Feed mode="siguiendo" /></RutaPrivada>} />
                <Route path="/coches/:id" element={<CarDetail />} />
                <Route path="/coches/:id/editar" element={<RutaPrivada><EditCar /></RutaPrivada>} />
                <Route path="/create" element={<RutaPrivada><CreatePost /></RutaPrivada>} />
                <Route path="/usuarios/:id" element={<UserProfile />} />
                <Route path="/usuarios/:id/seguidores" element={<FollowList tipo="seguidores" />} />
                <Route path="/usuarios/:id/seguidos" element={<FollowList tipo="seguidos" />} />
                <Route path="/publicaciones" element={<PostFeed />} />
                <Route path="/publicaciones/nueva" element={<RutaPrivada><NuevaPublicacion /></RutaPrivada>} />
                <Route path="/publicaciones/:id" element={<PostDetail />} />
                <Route path="/publicaciones/:id/editar" element={<RutaPrivada><EditPost /></RutaPrivada>} />
                <Route path="/notificaciones" element={<RutaPrivada><Notifications /></RutaPrivada>} />
                <Route path="/descubrir" element={<Discover />} />
                <Route path="/perfil/editar" element={<RutaPrivada><EditProfile /></RutaPrivada>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;
