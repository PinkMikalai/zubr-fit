import dumbbellIcon from '../../assets/icons/dumbbell.svg';

const API_URL = import.meta.env.VITE_API_URL;

// Vignette d'un exercice (image, ou icône haltère par défaut s'il n'y a pas d'illustration),
// réutilisée partout où un exercice est affiché en miniature : carte exercice, fiche détail,
// ligne de séance, aperçu tableau de bord. className porte la taille propre à chaque contexte
// (ex : "exercise-card-illustration"), la classe partagée .illustration-thumb gère le reste
// (recadrage, fond, centrage du placeholder).
function ExerciseThumbnail({ illustration, className }) {
  if (illustration) {
    return (
      <img
        src={`${API_URL}/uploads/illustrations/${illustration}`}
        alt=""
        className={className + ' illustration-thumb'}
      />
    );
  }

  const placeholderClassName = className + ' ' + className + '-placeholder illustration-thumb-placeholder';

  return (
    <div className={placeholderClassName}>
      <img src={dumbbellIcon} alt="" />
    </div>
  );
}

export default ExerciseThumbnail;
