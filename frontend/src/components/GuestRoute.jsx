import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// L'inverse de ProtectedRoute : réservé aux visiteurs NON connectés (connexion, inscription).
// Si l'utilisateur est déjà connecté, ça n'a plus de sens de lui montrer ces formulaires,
// on le renvoie directement vers son tableau de bord.
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default GuestRoute;
