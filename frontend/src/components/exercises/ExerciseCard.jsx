import { Link } from 'react-router-dom';
import ExerciseThumbnail from './ExerciseThumbnail';
import { getCategoryLabel, getLevelLabel } from '../../utils/exerciseLabels';

function ExerciseCard({ exercise, onDelete }) {
  // Les boutons Modifier/Supprimer font partie de la carte elle-même, pas un bloc à part en dessous.
  let footer = null;
  if (onDelete) {
    footer = (
      <footer className="exercise-card-footer">
        <Link to={`/exercises/${exercise.id}/edit`} className="button-warning">Modifier</Link>
        <button onClick={onDelete} className="button-danger">Supprimer</button>
      </footer>
    );
  }

  return (
    <article className="exercise-card card">
      <ExerciseThumbnail illustration={exercise.illustration} className="exercise-card-illustration" />
      <div className="exercise-card-body">
        <h3>
          <Link to={`/exercises/${exercise.id}`}>{exercise.name}</Link>
        </h3>
        <div className="exercise-card-badges">
          <span className="badge">{getCategoryLabel(exercise)}</span>
          <span className="badge">{getLevelLabel(exercise)}</span>
        </div>
        {footer}
      </div>
    </article>
  );
}

export default ExerciseCard;
