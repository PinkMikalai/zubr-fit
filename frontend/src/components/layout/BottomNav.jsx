import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import gridIcon from '../../assets/icons/grid.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import userIcon from '../../assets/icons/user.svg';
import homeIcon from '../../assets/icons/home.svg';
import infoIcon from '../../assets/icons/info.svg';

// Barre de navigation rapide en bas de l'écran, visible seulement en mobile
// (voir styles/layout/bottom-nav.css), comme sur la plupart des réseaux sociaux.
// Volontairement réduite aux pages essentielles pour rester lisible sur un petit écran :
// le reste (Exercices, Clients...) est accessible depuis le tiroir de MobileHeader.
function BottomNav() {
  const { isAuthenticated } = useAuth();

  // On prépare les liens à afficher AVANT le return, avec un if/else classique
  let links;

  if (isAuthenticated) {
    links = (
      <>
        <Link to="/dashboard" className="bottom-nav-link">
          <img src={gridIcon} alt="" />
          <span>Tableau de bord</span>
        </Link>
        <Link to="/seances" className="bottom-nav-link">
          <img src={calendarIcon} alt="" />
          <span>Séances</span>
        </Link>
        <Link to="/profile" className="bottom-nav-link">
          <img src={userIcon} alt="" />
          <span>Profil</span>
        </Link>
      </>
    );
  } else {
    links = (
      <>
        <Link to="/" className="bottom-nav-link">
          <img src={homeIcon} alt="" />
          <span>Accueil</span>
        </Link>
        <Link to="/about" className="bottom-nav-link">
          <img src={infoIcon} alt="" />
          <span>À propos</span>
        </Link>
      </>
    );
  }

  return <nav className="bottom-nav">{links}</nav>;
}

export default BottomNav;
