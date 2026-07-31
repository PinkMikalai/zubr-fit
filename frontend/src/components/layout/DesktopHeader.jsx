import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import searchIcon from '../../assets/icons/search.svg';
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
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) {
      navigate(`/seances?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/seances');
    }
  };

  // On prépare le contenu de la barre AVANT le return, avec un if/else classique
  let content;

  if (isAuthenticated) {
    content = (
      <>
        <form onSubmit={handleSearch} className="header-search">
          <img src={searchIcon} alt="" className="header-search-icon" />
          <input
            type="text"
            placeholder="Rechercher une séance..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
        <span className="header-date">
          <img src={calendarIcon} alt="" />
          {getTodayLabel()}
        </span>
      </>
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
