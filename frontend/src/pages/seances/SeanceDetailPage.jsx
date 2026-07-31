import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import seanceService from '../../services/seanceService';
import seanceExerciseService from '../../services/seanceExerciseService';
import { useAuth } from '../../hooks/useAuth';
import SeanceExerciseRow from '../../components/seances/SeanceExerciseRow';
import AddSeanceExerciseForm from '../../components/seances/AddSeanceExerciseForm';
import AssignSeanceForm from '../../components/seances/AssignSeanceForm';

function SeanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [seance, setSeance] = useState(null);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLines = () => {
    seanceExerciseService.list(id).then(setLines);
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

  const handleDelete = async () => {
    await seanceService.remove(id);
    navigate('/seances');
  };

  const handleComplete = async () => {
    const updated = await seanceService.complete(id);
    setSeance(updated);
  };

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

  const handleAssign = async (clientId) => {
    await seanceService.assign(id, [clientId]);
  };

  const handleUnassign = async (clientId) => {
    await seanceService.unassign(id, [clientId]);
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
      <button onClick={handleComplete} className="button-secondary">
        Marquer comme terminée
      </button>
    );
  }

  let coachActions = null;
  if (isCoach) {
    coachActions = (
      <>
        <Link to={`/seances/${id}/edit`} className="button-secondary">Modifier</Link>
        <button onClick={handleDelete} className="button-secondary">Supprimer</button>
      </>
    );
  }

  let assignSection = null;
  if (isCoach) {
    assignSection = (
      <section>
        <AssignSeanceForm onAssign={handleAssign} onUnassign={handleUnassign} />
        <p className="hint">
          Astuce : le backend ne permet pas encore de voir la liste des clients déjà assignés à cette séance.
        </p>
      </section>
    );
  }

  let addExerciseSection = null;
  if (isCoach) {
    addExerciseSection = <AddSeanceExerciseForm onAdd={handleAddExercise} />;
  }

  // Les boutons "Modifier"/"Retirer" sur chaque exercice ne sont passés que si on est coach,
  // sinon SeanceExerciseRow ne les affiche pas du tout.
  let removeExerciseHandler = null;
  let updateExerciseHandler = null;
  if (isCoach) {
    removeExerciseHandler = handleRemoveExercise;
    updateExerciseHandler = handleUpdateExercise;
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
        {lines.map((line) => (
          <SeanceExerciseRow
            key={line.id}
            line={line}
            onRemove={removeExerciseHandler}
            onUpdate={updateExerciseHandler}
          />
        ))}
      </ul>
    );
  }

  return (
    <div className="seance-detail">
      <div className="card seance-detail-header">
        <h1>{seance.name}</h1>
        <p>{seance.duration} min · {statusLabel}</p>
        {commentSection}

        <div className="seance-actions">
          {coachActions}
          {completeButton}
        </div>
      </div>

      <section className="card seance-create-section">
        <h2>Exercices</h2>
        {exercisesList}
        {addExerciseSection}
      </section>

      {assignSection}
    </div>
  );
}

export default SeanceDetailPage;
