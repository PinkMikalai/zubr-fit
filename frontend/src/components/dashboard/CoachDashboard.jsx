import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import coachClientService from '../../services/coachClientService';
import seanceService from '../../services/seanceService';
import exerciseService from '../../services/exerciseService';
import usersIcon from '../../assets/icons/users.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import dumbbellIcon from '../../assets/icons/dumbbell.svg';
import plusIcon from '../../assets/icons/plus.svg';

// Une carte de domaine du tableau de bord coach : Clients / Séances / Exercices.
// Toutes les cartes ont la même structure (icône + titre + chiffre + détail + bouton),
// donc on la définit une seule fois ici.
function DomainCard({ icon, title, listTo, count, countLabel, detail, actionTo, actionLabel }) {
  return (
    <div className="card domain-card">
      <div className="domain-card-head">
        <span className="domain-card-icon">
          <img src={icon} alt="" />
        </span>
        <Link to={listTo} className="domain-card-title">{title}</Link>
      </div>

      <p className="domain-card-count">{count}</p>
      <p className="domain-card-count-label">{countLabel}</p>
      <p className="domain-card-detail">{detail}</p>

      <Link to={actionTo} className="button-primary domain-card-action">
        <img src={plusIcon} alt="" />
        {actionLabel}
      </Link>
    </div>
  );
}

function CoachDashboard({ user }) {
  const [clients, setClients] = useState([]);
  const [seances, setSeances] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      coachClientService.list(),
      seanceService.list(),
      exerciseService.list(),
    ])
      .then(([clientsData, seancesData, exercisesData]) => {
        setClients(clientsData);
        setSeances(seancesData);
        setExercises(exercisesData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Chargement...</p>;
  }

  const completedCount = seances.filter((seance) => seance.completedAt).length;
  const pendingCount = seances.length - completedCount;

  // On prépare les phrases de détail AVANT le return, avec des if/else classiques
  let clientsDetail = 'Aucun client pour l\'instant';
  if (clients.length === 1) {
    clientsDetail = '1 client actif';
  } else if (clients.length > 1) {
    clientsDetail = clients.length + ' clients actifs';
  }

  let seancesDetail = 'Aucune séance créée';
  if (seances.length > 0) {
    seancesDetail = completedCount + ' terminée(s) · ' + pendingCount + ' en cours';
  }

  let exercisesDetail = 'Bibliothèque vide';
  if (exercises.length === 1) {
    exercisesDetail = '1 exercice dans la bibliothèque';
  } else if (exercises.length > 1) {
    exercisesDetail = exercises.length + ' exercices dans la bibliothèque';
  }

  return (
    <div>
      <h1>Bonjour, {user.firstname} !</h1>
      <p className="page-subtitle">Voici un aperçu de ton activité de coach</p>

      <div className="coach-domains">
        <DomainCard
          icon={usersIcon}
          title="Clients"
          listTo="/clients"
          count={clients.length}
          countLabel="clients actifs"
          detail={clientsDetail}
          actionTo="/clients"
          actionLabel="Ajouter un client"
        />
        <DomainCard
          icon={calendarIcon}
          title="Séances"
          listTo="/seances"
          count={seances.length}
          countLabel="séances créées"
          detail={seancesDetail}
          actionTo="/seances/new"
          actionLabel="Nouvelle séance"
        />
        <DomainCard
          icon={dumbbellIcon}
          title="Exercices"
          listTo="/exercises"
          count={exercises.length}
          countLabel="exercices"
          detail={exercisesDetail}
          actionTo="/exercises/new"
          actionLabel="Nouvel exercice"
        />
      </div>
    </div>
  );
}

export default CoachDashboard;
