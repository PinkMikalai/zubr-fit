const CATEGORY_LABELS = {
  musculation: 'Musculation',
  cardio: 'Cardio',
  mobilite: 'Mobilité',
  fonctionnel: 'Fonctionnel',
  autre: 'Autre',
};

const LEVEL_LABELS = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

// Le backend renvoie "Category" (majuscule) à cause d'une coquille sur l'entité Exercise,
// sauf dans SeanceExerciseController qui renvoie "category" (minuscule) — on gère les deux.
export function getCategoryLabel(exercise) {
  let category = exercise.Category;
  if (!category) {
    category = exercise.category;
  }

  let label = CATEGORY_LABELS[category];
  if (!label) {
    label = category;
  }
  return label;
}

export function getLevelLabel(exercise) {
  let label = LEVEL_LABELS[exercise.level];
  if (!label) {
    label = exercise.level;
  }
  return label;
}
