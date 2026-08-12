import PageMeta from '../components/layout/PageMeta';

function TermsPage() {
  return (
    <div className="terms-page">
      <PageMeta
        title="Conditions d'utilisation"
        description="Conditions d'utilisation et politique de confidentialité de zubr-fit : données collectées, droits des utilisateurs et mentions légales."
      />
      <section className="about-hero">
        <h1>Conditions d'utilisation et confidentialité</h1>
        <p className="home-tagline">
          Dernière mise à jour : 2026. En créant un compte sur zubr-fit, tu acceptes les règles
          décrites ci-dessous.
        </p>
      </section>

      <section className="about-section">
        <h2>1. Objet</h2>
        <p>
          zubr-fit est une plateforme de mise en relation entre coachs sportifs et leurs clients :
          création de séances d'entraînement, suivi de la progression, et échange de consignes.
          Ces conditions s'appliquent à tous les comptes, coachs comme clients.
        </p>
      </section>

      <section className="about-section">
        <h2>2. Données que nous collectons</h2>
        <p>Pour créer un compte, nous te demandons :</p>
        <ul className="terms-list">
          <li>ton prénom, ton nom et ton adresse e-mail (obligatoires) ;</li>
          <li>ton numéro de téléphone (optionnel) ;</li>
          <li>une photo de profil, si tu choisis d'en ajouter une (optionnelle) ;</li>
          <li>ton mot de passe, qui est chiffré (haché) avant d'être stocké : personne, pas même nous, ne peut le lire en clair.</li>
        </ul>
        <p>
          Si tu es coach, les exercices que tu crées peuvent aussi contenir une illustration
          (image) et une vidéo de démonstration.
        </p>
      </section>

      <section className="about-section">
        <h2>3. Photos, illustrations et vidéos</h2>
        <p>
          En important une image ou une vidéo sur zubr-fit (photo de profil, illustration ou
          vidéo d'exercice), tu garanties que tu en détiens les droits ou que tu es autorisé à
          l'utiliser, et tu nous autorises à l'héberger et à l'afficher aux personnes concernées
          (ton coach, tes clients, ou tout utilisateur de la plateforme selon le contenu).
        </p>
        <p>
          Tout contenu illégal, offensant ou portant atteinte aux droits d'un tiers est interdit
          et peut entraîner la suppression du contenu, voire du compte.
        </p>
      </section>

      <section className="about-section">
        <h2>4. Utilisation de tes données</h2>
        <p>
          Tes données ne servent qu'au fonctionnement de zubr-fit : afficher ton profil à ton
          coach ou à tes clients, gérer tes séances, et te permettre de te connecter. Elles ne
          sont ni vendues, ni partagées avec des tiers à des fins commerciales.
        </p>
      </section>

      <section className="about-section">
        <h2>5. Tes droits</h2>
        <p>
          Tu peux à tout moment consulter et corriger tes informations depuis ton profil. Pour
          demander la suppression complète de ton compte et de tes données, contacte-nous à
          l'adresse indiquée sur la page <a href="/about">À propos</a>.
        </p>
      </section>

      <section className="about-section">
        <h2>6. Sécurité du compte</h2>
        <p>
          Ta connexion est protégée par un jeton d'authentification stocké sur ton appareil. Ne
          partage jamais ton mot de passe. Si tu penses que ton compte a été compromis, change
          ton mot de passe immédiatement depuis ton profil.
        </p>
      </section>

      <section className="about-section">
        <h2>7. Mentions légales</h2>
        <p>
          zubr-fit est un projet réalisé dans un cadre pédagogique (version MVP - projet
          étudiant), à but non commercial. Il n'est pas exploité comme un service commercial réel.
        </p>
        <p>
          <strong>Réalisé par :</strong> Sashko Mikalai
          (<a href="https://www.linkedin.com/in/mikalai-sashko-90a4b1237/" target="_blank" rel="noopener noreferrer">profil LinkedIn</a>).<br />
          <strong>Hébergement :</strong> O2switch, 222 Boulevard Gustave Flaubert, 63000 Clermont-Ferrand, France.
        </p>
        <p>
          Le nom "zubr-fit", les textes, illustrations et éléments graphiques de ce site sont
          fournis à des fins de démonstration dans le cadre de ce projet. Pour toute question,
          contacte l'équipe du projet via les coordonnées indiquées sur la page <a href="/about">À propos</a>.
        </p>
      </section>
    </div>
  );
}

export default TermsPage;
