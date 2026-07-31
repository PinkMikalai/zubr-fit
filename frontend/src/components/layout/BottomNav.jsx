import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Barre de navigation rapide en bas de l'écran, visible seulement en mobile
// (voir styles/layout/bottom-nav.css), comme sur la plupart des réseaux sociaux.
function BottomNav() {
  const { isAuthenticated, user } = useAuth();

  // On prépare le rôle une seule fois, réutilisé pour les liens réservés aux coachs
  let isCoach = false;
  if (user && user.roles && user.roles.includes('ROLE_COACH')) {
    isCoach = true;
  }

  let clientsLink = null;
  if (isCoach) {
    clientsLink = <Link to="/clients">Clients</Link>;
  }

  let exercisesLink = null;
  if (isCoach) {
    exercisesLink = <Link to="/exercises">Exercices</Link>;
  }

  // On prépare les liens à afficher AVANT le return, avec un if/else classique
  let links;

  if (isAuthenticated) {
    links = (
      <>
        <Link to="/">Accueil</Link>
        <Link to="/dashboard">Tableau de bord</Link>
        {exercisesLink}
        <Link to="/seances">Séances</Link>
        {clientsLink}
        <Link to="/profile">Profil</Link>
      </>
    );
  } else {
    links = (
      <>
        <Link to="/">Accueil</Link>
        <Link to="/login">Connexion</Link>
        <Link to="/register">Inscription</Link>
      </>
    );
  }

  return <nav className="bottom-nav">{links}</nav>;
}

export default BottomNav;
