import { Link } from 'react-router-dom';
import dumbbellIcon from '../../assets/icons/dumbbell.svg';
import { getCategoryLabel, getLevelLabel } from '../../utils/exerciseLabels';

const API_URL = import.meta.env.VITE_API_URL;

function ExerciseCard({ exercise }) {
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

  return (
    <div className="exercise-card card">
      {illustration}
      <div className="exercise-card-body">
        <h3>
          <Link to={`/exercises/${exercise.id}`}>{exercise.name}</Link>
        </h3>
        <div className="exercise-card-badges">
          <span className="badge">{getCategoryLabel(exercise)}</span>
          <span className="badge">{getLevelLabel(exercise)}</span>
        </div>
      </div>
    </div>
  );
}

export default ExerciseCard;
