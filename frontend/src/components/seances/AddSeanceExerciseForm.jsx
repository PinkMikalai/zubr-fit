import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import exerciseService from '../../services/exerciseService';
import { useExerciseFilters } from '../../hooks/useExerciseFilters';
import ExerciseFilterBar from '../exercises/ExerciseFilterBar';

function AddSeanceExerciseForm({ onAdd }) {
  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [exerciseId, setExerciseId] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const exerciseFilters = useExerciseFilters(exercises);

  useEffect(() => {
    exerciseService
      .list()
      .then(setExercises)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingExercises(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!exerciseId) {
      setError('Choisis un exercice');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onAdd({ exerciseId: exerciseId, sets: sets, reps: reps });
      setExerciseId('');
      setSets('');
      setReps('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  let errorMessage = null;
  if (error) {
    errorMessage = <p className="form-error">{error}</p>;
  }

  let buttonText = 'Ajouter';
  if (submitting) {
    buttonText = 'Ajout...';
  }

  if (loadingExercises) {
    return <p className="card add-exercise-form">Chargement des exercices...</p>;
  }

  if (exercises.length === 0) {
    return (
      <div className="card add-exercise-form">
        <h3>Ajouter un exercice</h3>
        <p>
          Tu n'as pas encore d'exercice. <Link to="/exercises/new">En créer un</Link>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card add-exercise-form">
      <h3>Ajouter un exercice</h3>

      <div>
        <label htmlFor="exerciseId">Exercice</label>
        <ExerciseFilterBar
          category={exerciseFilters.category}
          level={exerciseFilters.level}
          onCategoryChange={exerciseFilters.setCategory}
          onLevelChange={exerciseFilters.setLevel}
        />
        <select id="exerciseId" value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
          <option value="">Choisir...</option>
          {exerciseFilters.filteredExercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sets">Séries</label>
        <input
          id="sets"
          type="number"
          min="1"
          placeholder="Ex : 3"
          value={sets}
          onChange={(e) => setSets(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="reps">Répétitions</label>
        <input
          id="reps"
          type="number"
          min="1"
          placeholder="Ex : 12"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
      </div>

      {errorMessage}

      <button type="submit" disabled={submitting}>
        {buttonText}
      </button>
    </form>
  );
}

export default AddSeanceExerciseForm;
