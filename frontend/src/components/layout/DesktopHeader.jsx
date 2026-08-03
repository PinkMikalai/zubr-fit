import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import calendarIcon from '../../assets/icons/calendar.svg';

// La date du jour, écrite en toutes lettres en français (ex : "Lundi 24 octobre")
function getTodayLabel() {
  const formatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const label = formatter.format(new Date());
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Barre du haut, desktop uniquement (voir styles/layout/desktop-header.css).
// Elle s'affiche au-dessus du contenu, à côté de la Sidebar (pas au-dessus d'elle).
// Sur mobile/tablette, c'est MobileHeader qui gère la barre du haut à la place.
function DesktopHeader() {
  const { isAuthenticated } = useAuth();

  // On prépare le contenu de la barre AVANT le return, avec un if/else classique
  let content;

  if (isAuthenticated) {
    content = (
      <span className="header-date">
        <img src={calendarIcon} alt="" />
        {getTodayLabel()}
      </span>
    );
  } else {
    content = (
      <div className="desktop-header-links">
        <Link to="/login">Connexion</Link>
        <Link to="/register">Inscription</Link>
      </div>
    );
  }

  return <header className="desktop-header">{content}</header>;
}

export default DesktopHeader;
