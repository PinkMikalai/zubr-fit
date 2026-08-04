// Les seules listes de catégories/niveaux de toute l'app : tout le monde (formulaires,
// filtres, affichage) importe ces tableaux au lieu de les recopier.
export const CATEGORY_OPTIONS = [
  { value: 'musculation', label: 'Musculation' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'mobilite', label: 'Mobilité' },
  { value: 'fonctionnel', label: 'Fonctionnel' },
  { value: 'autre', label: 'Autre' },
];

export const LEVEL_OPTIONS = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
];

function buildLabelMap(options) {
  const map = {};
  options.forEach((option) => {
    map[option.value] = option.label;
  });
  return map;
}

const CATEGORY_LABELS = buildLabelMap(CATEGORY_OPTIONS);
const LEVEL_LABELS = buildLabelMap(LEVEL_OPTIONS);

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
