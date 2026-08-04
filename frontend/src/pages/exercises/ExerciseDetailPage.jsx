import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import exerciseService from '../../services/exerciseService';

const API_URL = import.meta.env.VITE_API_URL;

function ExerciseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    exerciseService
      .getById(id)
      .then(setExercise)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    await exerciseService.remove(id);
    navigate('/exercises');
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  if (!exercise) {
    return null;
  }

  // Le backend renvoie "Category" (majuscule) à cause d'une coquille sur l'entité Exercise
  let category = exercise.Category;
  if (!category) {
    category = exercise.category;
  }

  // On prépare l'image AVANT le return, avec un if classique
  let illustrationImage = null;
  if (exercise.illustration) {
    illustrationImage = (
      <img src={`${API_URL}/uploads/illustrations/${exercise.illustration}`} alt={exercise.name} width="200" />
    );
  }

  // On prépare la vidéo AVANT le return, avec un if classique
  let videoPlayer = null;
  if (exercise.video) {
    videoPlayer = (
      <video controls width="320" src={`${API_URL}/uploads/videos/${exercise.video}`}>
        <track kind="captions" />
      </video>
    );
  }

  return (
    <div>
      <h1>{exercise.name}</h1>
      <p>{exercise.description}</p>
      <p>Catégorie : {category}</p>
      <p>Niveau : {exercise.level}</p>

      {illustrationImage}
      {videoPlayer}

      <div className="exercise-card-actions">
        <Link to={`/exercises/${id}/edit`} className="button-warning">Modifier</Link>
        <button onClick={handleDelete} className="button-danger">Supprimer</button>
      </div>
    </div>
  );
}

export default ExerciseDetailPage;
