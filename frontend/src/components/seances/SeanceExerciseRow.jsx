import { useState } from 'react';
import dumbbellIcon from '../../assets/icons/dumbbell.svg';
import trashIcon from '../../assets/icons/trash.svg';
import pencilIcon from '../../assets/icons/pencil.svg';
import chevronUpIcon from '../../assets/icons/chevron-up.svg';
import chevronDownIcon from '../../assets/icons/chevron-down.svg';
import { getCategoryLabel, getLevelLabel } from '../../utils/exerciseLabels';

const API_URL = import.meta.env.VITE_API_URL;

function SeanceExerciseRow({ line, onRemove, onUpdate, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [sets, setSets] = useState(line.sets);
  const [reps, setReps] = useState(line.reps);
  const [submitting, setSubmitting] = useState(false);

  const startEditing = () => {
    setSets(line.sets);
    setReps(line.reps);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await onUpdate(line.id, { sets: sets, reps: reps });
      setIsEditing(false);
    } finally {
      setSubmitting(false);
    }
  };

  // On prépare la vignette AVANT le return, avec un if/else classique.
  // S'il n'y a pas d'illustration, on affiche l'icône haltère sur un fond de couleur à la place.
  let thumbnail;
  if (line.exercise.illustration) {
    thumbnail = (
      <img
        src={`${API_URL}/uploads/illustrations/${line.exercise.illustration}`}
        alt=""
        className="exercise-line-thumbnail"
      />
    );
  } else {
    thumbnail = (
      <div className="exercise-line-thumbnail exercise-line-thumbnail-placeholder">
        <img src={dumbbellIcon} alt="" />
      </div>
    );
  }

  // Les flèches de réordonnancement ne sont affichées que si des gestionnaires ont été fournis (coach uniquement).
  // Le numéro de position est toujours affiché à côté, pour savoir clairement où on en est avant de cliquer.
  let reorderButtons = null;
  if (onMoveUp || onMoveDown) {
    reorderButtons = (
      <div className="exercise-line-reorder">
        <button type="button" onClick={onMoveUp} disabled={isFirst} aria-label="Monter l'exercice">
          <img src={chevronUpIcon} alt="" />
        </button>
        <span className="exercise-line-position">{line.position + 1}</span>
        <button type="button" onClick={onMoveDown} disabled={isLast} aria-label="Descendre l'exercice">
          <img src={chevronDownIcon} alt="" />
        </button>
      </div>
    );
  }

  // Les boutons "Modifier"/"Retirer" ne sont affichés que si un gestionnaire a été fourni (coach uniquement),
  // et pas du tout en mode édition (la ligne affiche déjà "Enregistrer"/"Annuler" à la place)
  let actionButtons = null;
  if ((onUpdate || onRemove) && !isEditing) {
    let editButton = null;
    if (onUpdate) {
      editButton = (
        <button onClick={startEditing} className="icon-button" aria-label="Modifier l'exercice">
          <img src={pencilIcon} alt="" />
        </button>
      );
    }

    let removeButton = null;
    if (onRemove) {
      removeButton = (
        <button onClick={() => onRemove(line.id)} className="icon-button" aria-label="Retirer l'exercice">
          <img src={trashIcon} alt="" />
        </button>
      );
    }

    actionButtons = (
      <div className="exercise-line-actions">
        {editButton}
        {removeButton}
      </div>
    );
  }

  // En mode édition, on affiche des champs séries/répétitions à la place du texte
  let footerContent;
  if (isEditing) {
    let saveButtonText = 'Enregistrer';
    if (submitting) {
      saveButtonText = '...';
    }

    footerContent = (
      <div className="exercise-line-edit">
        <h3>{line.position + 1}. {line.exercise.name}</h3>
        <div className="exercise-line-edit-fields">
          <input type="number" min="1" value={sets} onChange={(e) => setSets(e.target.value)} />
          <span>x</span>
          <input type="number" min="1" value={reps} onChange={(e) => setReps(e.target.value)} />
        </div>
        <div className="exercise-line-edit-fields">
          <button type="button" onClick={handleSave} disabled={submitting}>{saveButtonText}</button>
          <button type="button" onClick={() => setIsEditing(false)} className="button-secondary" disabled={submitting}>
            Annuler
          </button>
        </div>
      </div>
    );
  } else {
    footerContent = (
      <div className="exercise-line-info">
        <h3>{line.position + 1}. {line.exercise.name}</h3>
        <p className="exercise-line-tags">
          {getCategoryLabel(line.exercise)} · {getLevelLabel(line.exercise)}
        </p>
        <div className="exercise-line-stats">
          <div>
            <span className="exercise-line-stat-label">Séries</span>
            <span className="exercise-line-stat-value">{line.sets}</span>
          </div>
          <div>
            <span className="exercise-line-stat-label">Reps</span>
            <span className="exercise-line-stat-value">{line.reps}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <li className="card exercise-line">
      {reorderButtons}
      {thumbnail}
      <div className="exercise-line-footer">
        {footerContent}
        {actionButtons}
      </div>
    </li>
  );
}

export default SeanceExerciseRow;
