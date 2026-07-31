import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExerciseForm from '../../components/exercises/ExerciseForm';
import exerciseService from '../../services/exerciseService';

function ExerciseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // S'il y a un id dans l'URL (/exercises/6/edit), on est en mode édition.
  // S'il n'y en a pas (/exercises/new), on est en mode création.
  let isEditing = false;
  if (id) {
    isEditing = true;
  }

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    exerciseService
      .getById(id)
      .then(setInitialValues)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      if (isEditing) {
        await exerciseService.update(id, values);
      } else {
        await exerciseService.create(values);
      }
      navigate('/exercises');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  // On prépare le titre de la page AVANT le return, avec un if/else classique
  let title = 'Nouvel exercice';
  if (isEditing) {
    title = "Modifier l'exercice";
  }

  return (
    <div>
      <h1>{title}</h1>
      <ExerciseForm initialValues={initialValues} onSubmit={handleSubmit} submitting={submitting} error={error} />
    </div>
  );
}

export default ExerciseFormPage;
