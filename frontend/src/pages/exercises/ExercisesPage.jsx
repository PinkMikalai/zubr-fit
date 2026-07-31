import { Link } from 'react-router-dom';
import { useExercises } from '../../hooks/useExercises';
import ExerciseCard from '../../components/exercises/ExerciseCard';

function ExercisesPage() {
  const { exercises, loading, error, remove } = useExercises();

  if (loading) {
    return <p>Chargement...</p>;
  }

  // On prépare le message d'erreur AVANT le return, avec un if classique
  let errorMessage = null;
  if (error) {
    errorMessage = <p className="form-error">{error}</p>;
  }

  // On prépare la liste (ou le message "vide") AVANT le return, avec un if/else classique
  let content;
  if (exercises.length === 0) {
    content = <p>Aucun exercice pour l'instant.</p>;
  } else {
    content = (
      <ul className="exercise-list">
        {exercises.map((exercise) => (
          <li key={exercise.id}>
            <ExerciseCard exercise={exercise} />
            <button onClick={() => remove(exercise.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <h1>Mes exercices</h1>
      <Link to="/exercises/new">Nouvel exercice</Link>
      {errorMessage}
      {content}
    </div>
  );
}

export default ExercisesPage;
