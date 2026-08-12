import { Link } from 'react-router-dom';
import PageMeta from '../components/layout/PageMeta';
import userIcon from '../assets/icons/user.svg';
import dumbbellIcon from '../assets/icons/dumbbell.svg';
import calendarIcon from '../assets/icons/calendar.svg';
import statusIcon from '../assets/icons/status.svg';

// Une étape du fonctionnement de zubr-fit, avec son numéro dans un rond.
function Step({ number, title, description }) {
  return (
    <li className="card about-step">
      <span className="about-step-number">{number}</span>
      <div>
        <p className="about-step-title">{title}</p>
        <p>{description}</p>
      </div>
    </li>
  );
}

function AboutPage() {
  return (
    <div className="about-page">
      <PageMeta
        title="À propos"
        description="Découvre comment zubr-fit connecte coachs et clients : bibliothèque d'exercices, séances sur-mesure et suivi de la progression."
      />
      <section className="about-hero">
        <h1>À propos de zubr-fit</h1>
        <p className="home-tagline">
          zubr-fit est né d'un constat simple : un bon suivi sportif repose avant tout sur
          une communication claire entre le coach et son client. Notre plateforme met cette
          communication au centre de l'expérience.
        </p>
      </section>

      <section className="about-section">
        <h2>Notre mission</h2>
        <p>
          Beaucoup de coachs sportifs jonglent encore entre des messages épars, des feuilles
          de séances envoyées par mail et des carnets de suivi tenus à la main. zubr-fit
          rassemble tout ça au même endroit : la bibliothèque d'exercices, la construction
          des séances, l'assignation aux clients et le suivi de leur progression.
        </p>
        <p>
          Le client, de son côté, garde toujours une vision claire de ce qu'il doit faire,
          comment le faire (grâce aux vidéos de démonstration et aux consignes du coach),
          et de ce qu'il a déjà accompli.
        </p>
      </section>

      <section className="about-section">
        <h2>Comment ça marche</h2>
        <ul className="about-steps">
          <Step
            number="1"
            title="Créer un compte"
            description="En tant que coach pour construire tes séances, ou en tant que client pour rejoindre celles de ton coach."
          />
          <Step
            number="2"
            title="Construire sa bibliothèque"
            description="Le coach crée ses exercices (description, vidéo, niveau) puis assemble des séances complètes autour d'eux."
          />
          <Step
            number="3"
            title="Assigner aux clients"
            description="Chaque séance peut être assignée à un ou plusieurs clients, avec des consignes spécifiques si besoin."
          />
          <Step
            number="4"
            title="Suivre la progression"
            description="Le client avance dans ses séances, le coach voit en temps réel ce qui est en cours ou terminé."
          />
        </ul>
      </section>

      <section className="about-section">
        <h2>Nos valeurs</h2>
        <ul className="about-values">
          <li className="card about-value-card">
            <img src={dumbbellIcon} alt="" className="home-service-icon" />
            <div>
              <p className="home-service-title">Simplicité</p>
              <p>Une interface claire, sans fonctionnalité superflue, pour que chacun se concentre sur l'entraînement.</p>
            </div>
          </li>
          <li className="card about-value-card">
            <img src={calendarIcon} alt="" className="home-service-icon" />
            <div>
              <p className="home-service-title">Suivi personnalisé</p>
              <p>Chaque séance et chaque exercice peuvent être adaptés au niveau et aux objectifs du client.</p>
            </div>
          </li>
          <li className="card about-value-card">
            <img src={statusIcon} alt="" className="home-service-icon" />
            <div>
              <p className="home-service-title">Transparence</p>
              <p>Coach et client voient toujours la même information, au même moment, sans échange perdu.</p>
            </div>
          </li>
          <li className="card about-value-card">
            <img src={userIcon} alt="" className="home-service-icon" />
            <div>
              <p className="home-service-title">Proximité</p>
              <p>La relation coach-client reste au centre : zubr-fit facilite l'échange, il ne le remplace pas.</p>
            </div>
          </li>
        </ul>
      </section>

      <section className="home-cta">
        <p>Prêt à démarrer ?</p>
        <div className="home-hero-actions">
          <Link to="/register" className="button-primary">Créer un compte</Link>
          <Link to="/" className="button-secondary">Retour à l'accueil</Link>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
