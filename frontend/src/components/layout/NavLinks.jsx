import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import gridIcon from '../../assets/icons/grid.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import dumbbellIcon from '../../assets/icons/dumbbell.svg';
import usersIcon from '../../assets/icons/users.svg';
import userIcon from '../../assets/icons/user.svg';

// La liste des liens de navigation de la Sidebar (desktop uniquement : MobileHeader a son
// propre tiroir avec ses propres liens, voir components/layout/MobileHeader.jsx).
//
// hideAuthLinks est optionnel : la Sidebar le met à true, car Connexion/Inscription
// sont déjà affichés dans DesktopHeader sur desktop — pour ne pas les avoir deux fois.
function NavLinks({ hideAuthLinks }) {
  const { isAuthenticated, isCoach } = useAuth();

  // NavLink (au lieu de Link) ajoute automatiquement une classe quand le lien correspond
  // à la page actuelle, ce qui nous permet de le mettre en surbrillance.
  const linkClassName = ({ isActive }) => {
    if (isActive) {
      return 'nav-link nav-link-active';
    }
    return 'nav-link';
  };

  // "Clients" et "Exercices" (gestion de la bibliothèque) sont réservés aux coachs
  let clientsLink = null;
  if (isCoach) {
    clientsLink = (
      <NavLink to="/clients" className={linkClassName}>
        <img src={usersIcon} alt="" />
        Clients
      </NavLink>
    );
  }

  let exercisesLink = null;
  if (isCoach) {
    exercisesLink = (
      <NavLink to="/exercises" className={linkClassName}>
        <img src={dumbbellIcon} alt="" />
        Exercices
      </NavLink>
    );
  }

  // On prépare les liens à afficher AVANT le return, avec un if/else classique
  let links;

  if (isAuthenticated) {
    links = (
      <>
        <NavLink to="/dashboard" className={linkClassName} end>
          <img src={gridIcon} alt="" />
          Tableau de bord
        </NavLink>
        {exercisesLink}
        <NavLink to="/seances" className={linkClassName}>
          <img src={calendarIcon} alt="" />
          Séances
        </NavLink>
        {clientsLink}
        <NavLink to="/profile" className={linkClassName}>
          <img src={userIcon} alt="" />
          Mon profil
        </NavLink>
      </>
    );
  } else {
    // On prépare les liens de connexion/inscription AVANT le return, avec un if classique
    let authLinks = null;
    if (!hideAuthLinks) {
      authLinks = (
        <>
          <NavLink to="/login" className={linkClassName}>Connexion</NavLink>
          <NavLink to="/register" className={linkClassName}>Inscription</NavLink>
        </>
      );
    }

    links = (
      <>
        <NavLink to="/" className={linkClassName} end>Accueil</NavLink>
        <NavLink to="/about" className={linkClassName}>À propos</NavLink>
        {authLinks}
      </>
    );
  }

  return <nav className="nav-links">{links}</nav>;
}

export default NavLinks;
