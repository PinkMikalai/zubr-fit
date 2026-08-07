// Règles du formulaire d'exercice, les mêmes que celles vérifiées côté backend
// (ExerciseController::create), pour afficher l'erreur tout de suite sans attendre le serveur.
export function validateExerciseForm({ name, description, category, level }) {
  const errors = {};

  if (!name) {
    errors.name = 'Le nom est requis';
  } else if (name.trim() === '') {
    errors.name = 'Le nom est requis';
  }

  if (!description) {
    errors.description = 'La description est requise';
  } else if (description.trim() === '') {
    errors.description = 'La description est requise';
  }

  if (!category) {
    errors.category = 'La catégorie est requise';
  }

  if (!level) {
    errors.level = 'Le niveau est requis';
  }

  return errors;
}
