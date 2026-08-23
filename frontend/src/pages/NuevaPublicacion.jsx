import { useNavigate } from 'react-router-dom';
import PublicacionForm from '../components/PublicacionForm';

export default function NuevaPublicacion() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen pt-28 sm:pt-32 pb-16 px-4 flex justify-center bg-zinc-950">
            <PublicacionForm onGuardado={(p) => navigate(`/publicaciones/${p.id}`)} />
        </div>
    );
}
