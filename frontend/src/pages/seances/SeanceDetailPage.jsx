import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import seanceService from '../../services/seanceService';
import seanceExerciseService from '../../services/seanceExerciseService';
import { useAuth } from '../../hooks/useAuth';
import QuickAssignClients from '../../components/seances/QuickAssignClients';
import SeanceExerciseRow from '../../components/seances/SeanceExerciseRow';
import dumbbellIcon from '../../assets/icons/dumbbell.svg';
import usersIcon from '../../assets/icons/users.svg';
import userIcon from '../../assets/icons/user.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import statusIcon from '../../assets/icons/status.svg';
import { getLevelLabel } from '../../utils/exerciseLabels';
import { formatDate } from '../../utils/formatDate';

const API_URL = import.meta.env.VITE_API_URL;

// Page "Voir" d'une séance : uniquement de l'affichage (infos, exercices, clients assignés)
// et 3 actions simples (Modifier / Marquer comme terminée / Supprimer), plus une assignation
// rapide de client. Toute la vraie édition (structure des exercices, infos de base) se fait
// sur la page "Modifier" (SeanceFormPage).
function SeanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [seance, setSeance] = useState(null);
  const [lines, setLines] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAssignees = () => {
    seanceService.getAssignees(id).then(setAssignees);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([seanceService.getById(id), seanceExerciseService.list(id)])
      .then(([seanceData, linesData]) => {
        setSeance(seanceData);
        setLines(linesData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Chargé séparément, seulement si l'utilisateur est un coach (le backend refuse sinon)
  useEffect(() => {
    if (user && user.roles && user.roles.includes('ROLE_COACH')) {
      seanceService.getAssignees(id).then(setAssignees);
    }
  }, [id, user]);

  const handleDelete = async () => {
    await seanceService.remove(id);
    navigate('/seances');
  };

  const handleComplete = async () => {
    const updated = await seanceService.complete(id);
    setSeance(updated);
  };

  const handleAssign = async (clientId) => {
    await seanceService.assign(id, [clientId]);
    loadAssignees();
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  if (!seance) {
    return null;
  }

  // La gestion (modifier/supprimer/assignation) est réservée au coach.
  // Un client voit sa séance en lecture seule, mais peut la marquer comme terminée.
  let isCoach = false;
  if (user && user.roles && user.roles.includes('ROLE_COACH')) {
    isCoach = true;
  }

  let statusLabel = 'En cours';
  if (seance.completedAt) {
    statusLabel = `Terminée le ${formatDate(seance.completedAt)}`;
  }

  // Le niveau est optionnel : on ne l'affiche que s'il a été renseigné
  let levelBadge = null;
  if (seance.level) {
    levelBadge = <span className="seance-card-level">{getLevelLabel(seance)}</span>;
  }

  let completeButton = null;
  if (!seance.completedAt) {
    completeButton = (
      <button onClick={handleComplete} className="button-success">
        Marquer comme terminée
      </button>
    );
  }

  // Ordre voulu : Modifier, Marquer comme terminée, Supprimer (Supprimer toujours en dernier)
  let modifyButton = null;
  let deleteButton = null;
  if (isCoach) {
    modifyButton = <Link to={`/seances/${id}/edit`} className="button-warning">Modifier</Link>;
    deleteButton = <button onClick={handleDelete} className="button-danger">Supprimer</button>;
  }

  // On prépare la liste des clients déjà assignés AVANT le return, avec un if/else classique.
  // Pas de bouton "Désassigner" ici : c'est une page de consultation, le retrait d'un client
  // se fait depuis la page "Modifier".
  let assigneesList = null;
  if (assignees.length === 0) {
    assigneesList = <p className="hint">Aucun client assigné pour l'instant.</p>;
  } else {
    assigneesList = (
      <ul className="seance-assignee-list">
        {assignees.map((client) => {
          let avatarSrc = userIcon;
          if (client.avatarUrl) {
            avatarSrc = `${API_URL}${client.avatarUrl}`;
          }

          return (
            <li key={client.id}>
              <img src={avatarSrc} alt="" className="avatar-circle seance-assignee-avatar" />
              <span className="seance-assignee-name">{client.firstname} {client.lastname}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  let assignSection = null;
  if (isCoach) {
    assignSection = (
      <section className="card form-page-section">
        <h2><img src={usersIcon} alt="" className="section-icon" />Clients assignés ({assignees.length})</h2>
        {assigneesList}
        <QuickAssignClients assignees={assignees} onAssign={handleAssign} />
      </section>
    );
  }

  let commentSection = null;
  if (seance.comment) {
    commentSection = <p>{seance.comment}</p>;
  }

  // Les exercices sont ici en lecture seule : on ne passe aucun handler à SeanceExerciseRow
  // (ni onRemove, ni onUpdate, ni flèches), donc elle n'affiche que l'info, pas les actions.
  // Pour changer la structure de la séance, c'est la page "Modifier" qu'il faut utiliser.
  let exercisesList = null;
  if (lines.length === 0) {
    exercisesList = <p>Aucun exercice pour l'instant.</p>;
  } else {
    exercisesList = (
      <ul className="seance-exercise-list">
        {lines.map((line) => (
          <SeanceExerciseRow key={line.id} line={line} />
        ))}
      </ul>
    );
  }

  const structureSection = (
    <section className="card form-page-section">
      <h2><img src={dumbbellIcon} alt="" className="section-icon" />Exercices de la séance</h2>
      {exercisesList}
    </section>
  );

  // Un coach voit 2 colonnes côte à côte (assignation à gauche, exercices à droite) ;
  // un client ne voit que les exercices en pleine largeur, préparé AVANT le return avec un if/else classique
  let mainContent;
  if (isCoach) {
    mainContent = (
      <div className="form-page-grid">
        <div className="form-page-column">
          {assignSection}
        </div>
        <div className="form-page-column">
          {structureSection}
        </div>
      </div>
    );
  } else {
    mainContent = structureSection;
  }

  return (
    <div className="form-page">
      <nav className="breadcrumb">
        <Link to="/seances">Séances</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{seance.name}</span>
      </nav>

      <div className="card seance-detail-header">
        <div className="seance-detail-title-row">
          <h1>{seance.name}</h1>
          {levelBadge}
        </div>
        {commentSection}

        <div className="seance-detail-stats">
          <div className="seance-detail-stat">
            <img src={calendarIcon} alt="" />
            <div>
              <p className="seance-detail-stat-label">Durée</p>
              <p className="seance-detail-stat-value">{seance.duration} min</p>
            </div>
          </div>
          <div className="seance-detail-stat">
            <img src={statusIcon} alt="" />
            <div>
              <p className="seance-detail-stat-label">Statut</p>
              <p className="seance-detail-stat-value">{statusLabel}</p>
            </div>
          </div>
        </div>

        <div className="seance-actions">
          {modifyButton}
          {completeButton}
          {deleteButton}
        </div>
      </div>

      {mainContent}
    </div>
  );
}

export default SeanceDetailPage;
