import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NavLinks from './NavLinks';
import logoMark from '../../assets/icons/logo-mark.svg';
import userIcon from '../../assets/icons/user.svg';
import logoutIcon from '../../assets/icons/logout.svg';

const API_URL = import.meta.env.VITE_API_URL;

// Menu de gauche, visible seulement en desktop (voir styles/layout/sidebar.css).
// En dessous de la largeur "desktop", c'est MobileHeader qui prend le relais.
function Sidebar() {
  const { isAuthenticated, user, logout } = useAuth();

  // On prépare le sous-titre sous le logo AVANT le return, avec un if/else classique
  let tagline = 'La performance à votre portée';
  if (user && user.roles && user.roles.includes('ROLE_COACH')) {
    tagline = 'Espace Coach';
  } else if (user) {
    tagline = 'Espace Client';
  }

  // On prépare le pied de sidebar (profil + déconnexion) AVANT le return, avec un if classique.
  // Il n'apparaît que si l'utilisateur est connecté.
  let footer = null;
  if (isAuthenticated && user) {
    let avatarSrc = userIcon;
    if (user.avatarUrl) {
      avatarSrc = `${API_URL}${user.avatarUrl}`;
    }

    footer = (
      <div className="sidebar-footer">
        <Link to="/profile" className="sidebar-user">
          <img src={avatarSrc} alt="" className="avatar-circle sidebar-user-avatar" />
          <div>
            <p className="sidebar-user-name">{user.firstname} {user.lastname}</p>
          </div>
        </Link>
        <button onClick={logout} className="icon-button" aria-label="Se déconnecter">
          <img src={logoutIcon} alt="" />
        </button>
      </div>
    );
  }

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-brand">
        <span className="sidebar-logo-mark">
          <img src={logoMark} alt="" />
        </span>
        <div>
          <p className="sidebar-logo-text">zubr-fit</p>
          <p className="sidebar-tagline">{tagline}</p>
        </div>
      </Link>

      {/* hideAuthLinks : Connexion/Inscription sont déjà dans DesktopHeader en haut */}
      <NavLinks hideAuthLinks />

      {footer}
    </aside>
  );
}

export default Sidebar;
