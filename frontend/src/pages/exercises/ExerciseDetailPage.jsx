import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import exerciseService from '../../services/exerciseService';
import { getCategoryLabel, getLevelLabel } from '../../utils/exerciseLabels';
import dumbbellIcon from '../../assets/icons/dumbbell.svg';

const API_URL = import.meta.env.VITE_API_URL;

function ExerciseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    exerciseService
      .getById(id)
      .then(setExercise)
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await exerciseService.remove(id);
      navigate('/exercises');
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (loadError) {
    return <p className="form-error">{loadError}</p>;
  }

  if (!exercise) {
    return null;
  }

  // On prépare la vignette AVANT le return, avec un if/else classique.
  // S'il n'y a pas d'illustration, on affiche l'icône haltère sur un fond de couleur à la place.
  let illustration;
  if (exercise.illustration) {
    illustration = (
      <img
        src={`${API_URL}/uploads/illustrations/${exercise.illustration}`}
        alt=""
        className="exercise-detail-illustration"
      />
    );
  } else {
    illustration = (
      <div className="exercise-detail-illustration exercise-detail-illustration-placeholder">
        <img src={dumbbellIcon} alt="" />
      </div>
    );
  }

  let videoSection = null;
  if (exercise.video) {
    videoSection = (
      <div className="exercise-detail-video">
        <p className="exercise-detail-video-label">Vidéo de démonstration</p>
        <video controls src={`${API_URL}/uploads/videos/${exercise.video}`}>
          <track kind="captions" />
        </video>
      </div>
    );
  }

  let deleteErrorMessage = null;
  if (deleteError) {
    deleteErrorMessage = <p className="form-error">{deleteError}</p>;
  }

  return (
    <div className="form-page">
      <nav className="breadcrumb">
        <Link to="/exercises">Exercices</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{exercise.name}</span>
      </nav>

      <div className="card exercise-detail-card">
        {illustration}

        <div className="exercise-detail-body">
          <div className="exercise-detail-title-row">
            <h1>{exercise.name}</h1>
            <div className="exercise-detail-badges">
              <span className="badge">{getCategoryLabel(exercise)}</span>
              <span className="badge">{getLevelLabel(exercise)}</span>
            </div>
          </div>

          <p>{exercise.description}</p>

          {videoSection}

          {deleteErrorMessage}

          <div className="exercise-detail-actions">
            <Link to={`/exercises/${id}/edit`} className="button-warning">Modifier</Link>
            <button onClick={handleDelete} className="button-danger">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExerciseDetailPage;
