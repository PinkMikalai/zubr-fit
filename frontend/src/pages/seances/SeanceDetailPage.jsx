import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import seanceService from '../../services/seanceService';
import seanceExerciseService from '../../services/seanceExerciseService';
import { useAuth } from '../../hooks/useAuth';
import SeanceExerciseRow from '../../components/seances/SeanceExerciseRow';
import AddSeanceExerciseForm from '../../components/seances/AddSeanceExerciseForm';
import AssignSeanceForm from '../../components/seances/AssignSeanceForm';
import dumbbellIcon from '../../assets/icons/dumbbell.svg';
import usersIcon from '../../assets/icons/users.svg';
import userIcon from '../../assets/icons/user.svg';

const API_URL = import.meta.env.VITE_API_URL;

function SeanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [seance, setSeance] = useState(null);
  const [lines, setLines] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLines = () => {
    seanceExerciseService.list(id).then(setLines);
  };

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

  // Un exercice ajouté va toujours à la fin de la séance : sa position ne peut pas
  // rentrer en conflit avec un exercice déjà présent. Pour réordonner, on utilise les flèches.
  const handleAddExercise = async ({ exerciseId, sets, reps }) => {
    await seanceExerciseService.add(id, {
      exerciseId: exerciseId,
      sets: sets,
      reps: reps,
      position: lines.length,
    });
    loadLines();
  };

  const handleRemoveExercise = async (lineId) => {
    await seanceExerciseService.remove(id, lineId);
    loadLines();
  };

  const handleUpdateExercise = async (lineId, { sets, reps }) => {
    await seanceExerciseService.update(id, lineId, { sets: sets, reps: reps });
    loadLines();
  };

  // Échange la position de deux exercices déjà enregistrés, pour de vrai (côté serveur)
  const handleMoveLine = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= lines.length) {
      return;
    }

    const current = lines[index];
    const target = lines[targetIndex];

    await Promise.all([
      seanceExerciseService.update(id, current.id, { sets: current.sets, reps: current.reps, position: target.position }),
      seanceExerciseService.update(id, target.id, { sets: target.sets, reps: target.reps, position: current.position }),
    ]);
    loadLines();
  };

  const handleAssign = async (clientId) => {
    await seanceService.assign(id, [clientId]);
    loadAssignees();
  };

  const handleUnassign = async (clientId) => {
    await seanceService.unassign(id, [clientId]);
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

  // La gestion (modifier/supprimer/exercices/assignation) est réservée au coach.
  // Un client voit sa séance en lecture seule, mais peut la marquer comme terminée.
  let isCoach = false;
  if (user && user.roles && user.roles.includes('ROLE_COACH')) {
    isCoach = true;
  }

  let statusLabel = 'En cours';
  if (seance.completedAt) {
    statusLabel = 'Terminée';
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

  // On prépare la liste des clients déjà assignés AVANT le return, avec un if/else classique
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
              <button
                type="button"
                onClick={() => handleUnassign(client.id)}
                className="button-danger seance-assignee-remove"
              >
                Désassigner
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  let assignSection = null;
  if (isCoach) {
    assignSection = (
      <section className="card seance-create-section">
        <h2><img src={usersIcon} alt="" className="section-icon" />Assigner à des clients</h2>

        <div className="card seance-assignees-block">
          <p className="seance-assignees-title">Clients assignés ({assignees.length})</p>
          {assigneesList}
        </div>

        <AssignSeanceForm onAssign={handleAssign} onUnassign={handleUnassign} />
      </section>
    );
  }

  let addExerciseSection = null;
  if (isCoach) {
    addExerciseSection = <AddSeanceExerciseForm onAdd={handleAddExercise} />;
  }

  // Les boutons "Modifier"/"Retirer"/flèches sur chaque exercice ne sont passés que si on est coach,
  // sinon SeanceExerciseRow ne les affiche pas du tout.
  let removeExerciseHandler = null;
  let updateExerciseHandler = null;
  let makeMoveUpHandler = null;
  let makeMoveDownHandler = null;
  if (isCoach) {
    removeExerciseHandler = handleRemoveExercise;
    updateExerciseHandler = handleUpdateExercise;
    makeMoveUpHandler = (index) => () => handleMoveLine(index, -1);
    makeMoveDownHandler = (index) => () => handleMoveLine(index, 1);
  }

  let commentSection = null;
  if (seance.comment) {
    commentSection = <p>{seance.comment}</p>;
  }

  let exercisesList = null;
  if (lines.length === 0) {
    exercisesList = <p>Aucun exercice pour l'instant.</p>;
  } else {
    exercisesList = (
      <ul className="seance-exercise-list">
        {lines.map((line, index) => {
          let onMoveUp = null;
          let onMoveDown = null;
          if (makeMoveUpHandler) {
            onMoveUp = makeMoveUpHandler(index);
            onMoveDown = makeMoveDownHandler(index);
          }

          let isFirst = false;
          if (index === 0) {
            isFirst = true;
          }

          let isLast = false;
          if (index === lines.length - 1) {
            isLast = true;
          }

          return (
            <SeanceExerciseRow
              key={line.id}
              line={line}
              onRemove={removeExerciseHandler}
              onUpdate={updateExerciseHandler}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              isFirst={isFirst}
              isLast={isLast}
            />
          );
        })}
      </ul>
    );
  }

  // Exercices de la séance, réutilisé dans les deux mises en page ci-dessous
  const structureSection = (
    <section className="card seance-create-section">
      <h2><img src={dumbbellIcon} alt="" className="section-icon" />Exercices de la séance</h2>
      {exercisesList}
      {addExerciseSection}
    </section>
  );

  // Un coach voit 2 colonnes côte à côte (assignation à gauche, exercices à droite) ;
  // un client ne voit que les exercices en pleine largeur, préparé AVANT le return avec un if/else classique
  let mainContent;
  if (isCoach) {
    mainContent = (
      <div className="seance-create-grid">
        <div className="seance-create-column">
          {assignSection}
        </div>
        <div className="seance-create-column">
          {structureSection}
        </div>
      </div>
    );
  } else {
    mainContent = structureSection;
  }

  return (
    <div className="seance-create-page">
      <nav className="breadcrumb">
        <Link to="/seances">Séances</Link>
        <span>/</span>
        <span>{seance.name}</span>
      </nav>

      <div className="card seance-detail-header">
        <h1>{seance.name}</h1>
        <p>{seance.duration} min · {statusLabel}</p>
        {commentSection}

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
