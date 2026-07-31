import { useAuth } from '../hooks/useAuth';

// A utiliser À L'INTÉRIEUR de ProtectedRoute (qui gère déjà "faut être connecté").
// Celui-ci bloque en plus l'accès aux pages réservées aux coachs (gestion des
// exercices, création/édition de séances, gestion des clients).
const CoachRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Chargement...</p>;
  }

  let isCoach = false;
  if (user && user.roles && user.roles.includes('ROLE_COACH')) {
    isCoach = true;
  }

  if (!isCoach) {
    return <p>Cette page est réservée aux coachs.</p>;
  }

  return children;
};

export default CoachRoute;
