import { useState } from 'react';
import ExerciseThumbnail from '../exercises/ExerciseThumbnail';
import trashIcon from '../../assets/icons/trash.svg';
import pencilIcon from '../../assets/icons/pencil.svg';
import chevronUpIcon from '../../assets/icons/chevron-up.svg';
import chevronDownIcon from '../../assets/icons/chevron-down.svg';
import { getCategoryLabel, getLevelLabel } from '../../utils/exerciseLabels';

const API_URL = import.meta.env.VITE_API_URL;

// Le commentaire est optionnel : le backend peut renvoyer null, mais un textarea contrôlé
// a besoin d'une chaîne vide, jamais de null/undefined.
function getCommentValue(comment) {
  if (!comment) {
    return '';
  }
  return comment;
}

function SeanceExerciseRow({ line, onRemove, onUpdate, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [sets, setSets] = useState(line.sets);
  const [reps, setReps] = useState(line.reps);
  const [comment, setComment] = useState(getCommentValue(line.comment));
  const [submitting, setSubmitting] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const startEditing = () => {
    setSets(line.sets);
    setReps(line.reps);
    setComment(getCommentValue(line.comment));
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await onUpdate(line.id, { sets: sets, reps: reps, comment: comment });
      setIsEditing(false);
    } finally {
      setSubmitting(false);
    }
  };

  const thumbnail = (
    <ExerciseThumbnail illustration={line.exercise.illustration} className="exercise-line-thumbnail" />
  );

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
        <textarea
          className="exercise-line-edit-comment"
          placeholder="Consigne pour cette séance (optionnel)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
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

  // Le commentaire est la consigne du coach spécifique à CETTE séance (différent de la description
  // générique de l'exercice) : on le met en avant avec un style distinct, quand il y en a un.
  let commentIcon = chevronDownIcon;
  if (isCommentOpen) {
    commentIcon = chevronUpIcon;
  }

  let commentBody = null;
  if (isCommentOpen) {
    commentBody = <p>{line.comment}</p>;
  }

  let commentSection = null;
  if (!isEditing && line.comment) {
    commentSection = (
      <div className="exercise-line-comment">
        <button
          type="button"
          className="exercise-line-section-toggle"
          onClick={() => setIsCommentOpen(!isCommentOpen)}
        >
          <span className="exercise-line-comment-label">Consigne du coach</span>
          <img src={commentIcon} alt="" />
        </button>
        {commentBody}
      </div>
    );
  }

  // La description ("quoi faire") et la vidéo de démonstration ne sont affichées qu'en mode consultation,
  // pas pendant l'édition des séries/répétitions.
  let descriptionIcon = chevronDownIcon;
  if (isDescriptionOpen) {
    descriptionIcon = chevronUpIcon;
  }

  let descriptionBody = null;
  if (isDescriptionOpen) {
    descriptionBody = <p>{line.exercise.description}</p>;
  }

  let descriptionSection = null;
  if (!isEditing && line.exercise.description) {
    descriptionSection = (
      <div className="exercise-line-description">
        <button
          type="button"
          className="exercise-line-section-toggle"
          onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
        >
          <span className="exercise-line-description-label">Quoi faire</span>
          <img src={descriptionIcon} alt="" />
        </button>
        {descriptionBody}
      </div>
    );
  }

  let videoSection = null;
  if (!isEditing && line.exercise.video) {
    videoSection = (
      <div className="exercise-line-video">
        <p className="exercise-line-video-label">Vidéo de démonstration</p>
        <video controls src={`${API_URL}/uploads/videos/${line.exercise.video}`}>
          <track kind="captions" />
        </video>
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
      {commentSection}
      {descriptionSection}
      {videoSection}
    </li>
  );
}

export default SeanceExerciseRow;
