// Règles du formulaire de séance, les mêmes que celles vérifiées côté backend
// (SeanceController::create), pour afficher l'erreur tout de suite sans attendre le serveur.
export function validateSeanceForm({ name, duration, level }) {
  const errors = {};

  if (!name) {
    errors.name = 'Le nom est requis';
  } else if (name.trim() === '') {
    errors.name = 'Le nom est requis';
  }

  if (!duration) {
    errors.duration = 'La durée est requise';
  } else if (isNaN(duration)) {
    errors.duration = 'La durée doit être un nombre';
  } else if (Number(duration) <= 0) {
    errors.duration = 'La durée doit être positive';
  }

  if (!level) {
    errors.level = 'Le niveau est requis';
  }

  return errors;
}

// Règles d'une ligne d'exercice (séries/répétitions), utilisées à la création d'une séance
// ET quand on ajoute un exercice à une séance existante.
export function validateExerciseLine({ exerciseId, sets, reps }) {
  const errors = {};

  if (!exerciseId) {
    errors.exerciseId = "L'exercice est requis";
  }

  if (!sets) {
    errors.sets = 'Le nombre de séries est requis';
  } else if (isNaN(sets)) {
    errors.sets = 'Le nombre de séries doit être un nombre';
  } else if (Number(sets) <= 0) {
    errors.sets = 'Le nombre de séries doit être positif';
  }

  if (!reps) {
    errors.reps = 'Le nombre de répétitions est requis';
  } else if (isNaN(reps)) {
    errors.reps = 'Le nombre de répétitions doit être un nombre';
  } else if (Number(reps) <= 0) {
    errors.reps = 'Le nombre de répétitions doit être positif';
  }

  return errors;
}
