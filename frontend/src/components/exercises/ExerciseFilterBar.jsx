import { CATEGORY_OPTIONS, LEVEL_OPTIONS } from '../../utils/exerciseLabels';

// Les deux menus déroulants "Catégorie" / "Niveau", utilisés avec le hook useExerciseFilters.
// Un seul composant pour ne pas répéter ces deux <select> partout où on filtre des exercices.
function ExerciseFilterBar({ category, level, onCategoryChange, onLevelChange }) {
  return (
    <div className="exercise-filter-bar">
      <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
        <option value="">Toutes les catégories</option>
        {CATEGORY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>

      <select value={level} onChange={(e) => onLevelChange(e.target.value)}>
        <option value="">Tous les niveaux</option>
        {LEVEL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

export default ExerciseFilterBar;
