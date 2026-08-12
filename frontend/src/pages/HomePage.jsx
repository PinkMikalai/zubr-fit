import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageMeta from '../components/layout/PageMeta';
import dumbbellIcon from '../assets/icons/dumbbell.svg';
import calendarIcon from '../assets/icons/calendar.svg';
import usersIcon from '../assets/icons/users.svg';
import statusIcon from '../assets/icons/status.svg';
import checkIcon from '../assets/icons/check.svg';
import userIcon from '../assets/icons/user.svg';

// La carte d'un service, réutilisée pour la colonne coach ET la colonne client.
function ServiceCard({ icon, title, description }) {
  return (
    <li className="card home-service-card">
      <img src={icon} alt="" className="home-service-icon" />
      <div>
        <p className="home-service-title">{title}</p>
        <p>{description}</p>
      </div>
    </li>
  );
}

function HomePage() {
  const { isAuthenticated } = useAuth();

  // Le bouton d'action principal change selon que l'utilisateur est déjà connecté ou non
  let heroActions;
  if (isAuthenticated) {
    heroActions = (
      <Link to="/dashboard" className="button-primary">Aller à mon tableau de bord</Link>
    );
  } else {
    heroActions = (
      <div className="home-hero-actions">
        <Link to="/register" className="button-primary">Créer un compte</Link>
        <Link to="/login" className="button-secondary">Se connecter</Link>
      </div>
    );
  }

  return (
    <div className="home-page">
      <PageMeta
        title="Accueil"
        description="zubr-fit connecte coachs et clients pour suivre l'entraînement : création de séances, exercices personnalisés et suivi des progrès."
      />
      <section className="home-hero">
        <h1>zubr-fit</h1>
        <p className="home-tagline">
          La plateforme qui connecte les coachs sportifs à leurs clients : séances sur-mesure,
          suivi précis, progression visible pour tout le monde.
        </p>
        {heroActions}
      </section>

      <section className="home-services">
        <h2>Nos services</h2>
        <p className="page-subtitle">Que tu sois coach ou client, zubr-fit s'adapte à ton usage.</p>

        <div className="home-services-columns">
          <div className="home-services-column">
            <h3>Pour les coachs</h3>
            <ul className="home-services-list">
              <ServiceCard
                icon={dumbbellIcon}
                title="Bibliothèque d'exercices"
                description="Crée tes propres exercices avec description, catégorie, niveau, illustration et vidéo de démonstration."
              />
              <ServiceCard
                icon={calendarIcon}
                title="Séances sur-mesure"
                description="Construis des séances complètes : exercices, séries, répétitions et consignes personnalisées pour chaque client."
              />
              <ServiceCard
                icon={usersIcon}
                title="Gestion des clients"
                description="Ajoute tes clients, retrouve ton historique de collaboration et assigne des séances à un ou plusieurs athlètes à la fois."
              />
              <ServiceCard
                icon={statusIcon}
                title="Suivi de la progression"
                description="Visualise en un coup d'œil les séances en cours et terminées de chacun de tes clients."
              />
            </ul>
          </div>

          <div className="home-services-column">
            <h3>Pour les clients</h3>
            <ul className="home-services-list">
              <ServiceCard
                icon={calendarIcon}
                title="Mes séances"
                description="Retrouve toutes les séances que ton coach t'a assignées, en cours ou déjà terminées."
              />
              <ServiceCard
                icon={dumbbellIcon}
                title="Le détail de chaque exercice"
                description="Description, vidéo de démonstration et consignes spécifiques laissées par ton coach pour chaque exercice."
              />
              <ServiceCard
                icon={checkIcon}
                title="Suis ta progression"
                description="Marque tes séances comme terminées et garde une trace claire de ton parcours d'entraînement."
              />
              <ServiceCard
                icon={userIcon}
                title="Ton profil"
                description="Gère tes informations personnelles et ta photo de profil, pour rester connecté avec ton coach."
              />
            </ul>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <p>Envie de comprendre comment fonctionne zubr-fit ?</p>
        <Link to="/about" className="button-secondary">En savoir plus</Link>
      </section>
    </div>
  );
}

export default HomePage;
