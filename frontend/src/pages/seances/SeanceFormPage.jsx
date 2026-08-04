import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SeanceForm from '../../components/seances/SeanceForm';
import AssignSeanceForm from '../../components/seances/AssignSeanceForm';
import SeanceExerciseRow from '../../components/seances/SeanceExerciseRow';
import AddSeanceExerciseForm from '../../components/seances/AddSeanceExerciseForm';
import seanceService from '../../services/seanceService';
import seanceExerciseService from '../../services/seanceExerciseService';
import infoIcon from '../../assets/icons/info.svg';
import usersIcon from '../../assets/icons/users.svg';
import userIcon from '../../assets/icons/user.svg';
import dumbbellIcon from '../../assets/icons/dumbbell.svg';

const API_URL = import.meta.env.VITE_API_URL;

// Vraie page de gestion d'une séance déjà créée : les infos de base, les clients assignés
// et la structure des exercices se modifient tous ici (même mise en page que SeanceCreatePage).
// La page "Voir" (SeanceDetailPage) ne fait qu'afficher, sans possibilité d'édition.
function SeanceFormPage() {
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const loadAssignees = () => {
    seanceService.getAssignees(id).then(setAssignees);
  };

  const loadLines = () => {
    seanceExerciseService.list(id).then(setLines);
  };

  useEffect(() => {
    seanceService
      .getById(id)
      .then(setInitialValues)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    seanceService.getAssignees(id).then(setAssignees);
    seanceExerciseService.list(id).then(setLines);
  }, [id]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await seanceService.update(id, values);
      setInitialValues(updated);
      setSuccessMessage('Séance mise à jour.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (clientId) => {
    await seanceService.assign(id, [clientId]);
    loadAssignees();
  };

  const handleUnassign = async (clientId) => {
    await seanceService.unassign(id, [clientId]);
    loadAssignees();
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

  if (loading) {
    return <p>Chargement...</p>;
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

  // On prépare la liste des exercices déjà ajoutés AVANT le return, avec un if/else classique
  let exercisesList = null;
  if (lines.length === 0) {
    exercisesList = <p>Aucun exercice pour l'instant.</p>;
  } else {
    exercisesList = (
      <ul className="seance-exercise-list">
        {lines.map((line, index) => {
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
              onRemove={handleRemoveExercise}
              onUpdate={handleUpdateExercise}
              onMoveUp={() => handleMoveLine(index, -1)}
              onMoveDown={() => handleMoveLine(index, 1)}
              isFirst={isFirst}
              isLast={isLast}
            />
          );
        })}
      </ul>
    );
  }

  let successParagraph = null;
  if (successMessage) {
    successParagraph = <p className="form-success">{successMessage}</p>;
  }

  return (
    <div className="form-page">
      <nav className="breadcrumb">
        <Link to="/seances">Séances</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Modifier</span>
      </nav>

      <h1>Modifier la séance</h1>

      <div className="form-page-grid">
        <div className="form-page-column">
          <section className="card form-page-section">
            <h2><img src={infoIcon} alt="" className="section-icon" />Informations générales</h2>
            <SeanceForm initialValues={initialValues} onSubmit={handleSubmit} submitting={submitting} error={error} />
            {successParagraph}
          </section>

          <section className="card form-page-section">
            <h2><img src={usersIcon} alt="" className="section-icon" />Assigner à des clients</h2>

            <div className="card seance-assignees-block">
              <p className="seance-assignees-title">Clients assignés ({assignees.length})</p>
              {assigneesList}
            </div>

            <AssignSeanceForm onAssign={handleAssign} />
          </section>
        </div>

        <div className="form-page-column">
          <section className="card form-page-section">
            <h2><img src={dumbbellIcon} alt="" className="section-icon" />Exercices de la séance</h2>
            {exercisesList}
            <AddSeanceExerciseForm onAdd={handleAddExercise} />
          </section>
        </div>
      </div>
    </div>
  );
}

export default SeanceFormPage;
