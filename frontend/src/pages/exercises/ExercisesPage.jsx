import { Link } from 'react-router-dom';
import { useExercises } from '../../hooks/useExercises';
import { useExerciseFilters } from '../../hooks/useExerciseFilters';
import ExerciseCard from '../../components/exercises/ExerciseCard';
import ExerciseFilterBar from '../../components/exercises/ExerciseFilterBar';

function ExercisesPage() {
  const { exercises, loading, error, remove } = useExercises();
  const { category, setCategory, level, setLevel, filteredExercises } = useExerciseFilters(exercises);

  if (loading) {
    return <p>Chargement...</p>;
  }

  // On prépare le message d'erreur AVANT le return, avec un if classique
  let errorMessage = null;
  if (error) {
    errorMessage = <p className="form-error">{error}</p>;
  }

  // On prépare le filtre : inutile de l'afficher s'il n'y a pas encore d'exercice
  let filterBar = null;
  if (exercises.length > 0) {
    filterBar = (
      <ExerciseFilterBar category={category} level={level} onCategoryChange={setCategory} onLevelChange={setLevel} />
    );
  }

  // On prépare la liste (ou le message "vide") AVANT le return, avec un if/else classique
  let content;
  if (exercises.length === 0) {
    content = <p>Aucun exercice pour l'instant.</p>;
  } else if (filteredExercises.length === 0) {
    content = <p>Aucun exercice ne correspond à ce filtre.</p>;
  } else {
    content = (
      <ul className="card-grid">
        {filteredExercises.map((exercise) => (
          <li key={exercise.id}>
            <ExerciseCard exercise={exercise} onDelete={() => remove(exercise.id)} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mes exercices</h1>
          <p className="page-description">Gère la bibliothèque d'exercices que tu utilises dans tes séances.</p>
        </div>
        <Link to="/exercises/new" className="button-primary">Nouvel exercice</Link>
      </div>

      {errorMessage}
      {filterBar}
      {content}
    </div>
  );
}

export default ExercisesPage;
