import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import menuIcon from '../../assets/icons/menu.svg';
import closeIcon from '../../assets/icons/close.svg';
import gridIcon from '../../assets/icons/grid.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import usersIcon from '../../assets/icons/users.svg';
import dumbbellIcon from '../../assets/icons/dumbbell.svg';
import userIcon from '../../assets/icons/user.svg';
import logoutIcon from '../../assets/icons/logout.svg';

const API_URL = import.meta.env.VITE_API_URL;

// Barre du haut + tiroir de navigation, visible seulement en tablette/mobile
// (voir styles/layout/mobile-header.css). Sur desktop, c'est Sidebar qui prend le relais.
function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  // On prépare l'icône du bouton menu/fermer AVANT le return, avec un if/else classique
  let toggleIcon = menuIcon;
  if (isMenuOpen) {
    toggleIcon = closeIcon;
  }

  // On prépare l'avatar du profil AVANT le return, avec un if/else classique
  let avatarSrc = userIcon;
  if (user && user.avatarUrl) {
    avatarSrc = `${API_URL}${user.avatarUrl}`;
  }

  // On prépare le rôle une seule fois, réutilisé pour le libellé et les liens réservés aux coachs
  let isCoach = false;
  if (user && user.roles && user.roles.includes('ROLE_COACH')) {
    isCoach = true;
  }

  let roleLabel = 'Client';
  if (isCoach) {
    roleLabel = 'Coach';
  }

  // "Mes clients" et "Exercices" (gestion de la bibliothèque) sont réservés aux coachs :
  // un client n'a pas sa propre bibliothèque d'exercices à gérer.
  let clientsLink = null;
  if (isCoach) {
    clientsLink = (
      <Link to="/clients" onClick={closeMenu} className="drawer-link">
        <img src={usersIcon} alt="" />
        Mes clients
      </Link>
    );
  }

  let exercisesLink = null;
  if (isCoach) {
    exercisesLink = (
      <Link to="/exercises" onClick={closeMenu} className="drawer-link">
        <img src={dumbbellIcon} alt="" />
        Exercices
      </Link>
    );
  }

  // On prépare le contenu du tiroir AVANT le return, avec un if/else classique
  let drawerContent = null;
  if (isAuthenticated) {
    drawerContent = (
      <>
        <div className="drawer-profile">
          <img src={avatarSrc} alt="" className="avatar-circle drawer-profile-avatar" />
          <div>
            <p className="drawer-profile-name">{user && user.firstname} {user && user.lastname}</p>
            <p className="drawer-profile-role">{roleLabel}</p>
          </div>
        </div>

        <nav className="drawer-links">
          <Link to="/dashboard" onClick={closeMenu} className="drawer-link">
            <img src={gridIcon} alt="" />
            Tableau de bord
          </Link>
          {clientsLink}
          {exercisesLink}
          <Link to="/seances" onClick={closeMenu} className="drawer-link">
            <img src={calendarIcon} alt="" />
            Mes séances
          </Link>
          <Link to="/profile" onClick={closeMenu} className="drawer-link">
            <img src={userIcon} alt="" />
            Mon profil
          </Link>
        </nav>

        <button onClick={handleLogout} className="drawer-logout">
          <img src={logoutIcon} alt="" />
          Déconnexion
        </button>
      </>
    );
  } else {
    drawerContent = (
      <nav className="drawer-links">
        <Link to="/" onClick={closeMenu} className="drawer-link">Accueil</Link>
        <Link to="/login" onClick={closeMenu} className="drawer-link">Connexion</Link>
        <Link to="/register" onClick={closeMenu} className="drawer-link">Inscription</Link>
      </nav>
    );
  }

  // On prépare l'habillage du tiroir (overlay + panneau) AVANT le return, avec un if classique
  let drawer = null;
  if (isMenuOpen) {
    drawer = (
      <div className="drawer-overlay" onClick={closeMenu}>
        <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
          {drawerContent}
        </div>
      </div>
    );
  }

  return (
    <header className="mobile-header">
      <button onClick={toggleMenu} className="menu-toggle" aria-label="Menu">
        <img src={toggleIcon} alt="" />
      </button>
      <Link to="/" onClick={closeMenu} className="mobile-header-logo">
        zubr-fit
      </Link>
      <div className="mobile-header-spacer" />
      {drawer}
    </header>
  );
}

export default MobileHeader;
