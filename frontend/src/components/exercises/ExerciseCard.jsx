import { Link } from 'react-router-dom';
import dumbbellIcon from '../../assets/icons/dumbbell.svg';
import { getCategoryLabel, getLevelLabel } from '../../utils/exerciseLabels';

const API_URL = import.meta.env.VITE_API_URL;

function ExerciseCard({ exercise, onDelete }) {
  // On prépare l'image AVANT le return, avec un if/else classique.
  // S'il n'y a pas d'illustration, on affiche l'icône haltère sur un fond de couleur à la place.
  let illustration;
  if (exercise.illustration) {
    illustration = (
      <img
        src={`${API_URL}/uploads/illustrations/${exercise.illustration}`}
        alt=""
        className="exercise-card-illustration"
      />
    );
  } else {
    illustration = (
      <div className="exercise-card-illustration exercise-card-illustration-placeholder">
        <img src={dumbbellIcon} alt="" />
      </div>
    );
  }

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
      {illustration}
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
