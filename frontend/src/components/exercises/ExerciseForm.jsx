import { useState } from 'react';
import { CATEGORY_OPTIONS, LEVEL_OPTIONS } from '../../utils/exerciseLabels';

// Calcule les valeurs de départ du formulaire à partir de l'exercice existant (si on est en édition)
function getInitialFormValues(initialValues) {
  // Si on est en création, il n'y a pas d'exercice existant : on part de champs vides
  if (!initialValues) {
    return {
      name: '',
      description: '',
      category: 'musculation',
      level: 'debutant',
    };
  }

  // Le backend renvoie "Category" (majuscule) à cause d'une coquille sur l'entité Exercise
  let category = initialValues.Category;
  if (!category) {
    category = initialValues.category;
  }
  if (!category) {
    category = 'musculation';
  }

  let level = initialValues.level;
  if (!level) {
    level = 'debutant';
  }

  return {
    name: initialValues.name,
    description: initialValues.description,
    category: category,
    level: level,
  };
}

function ExerciseForm({ initialValues, onSubmit, submitting, error }) {
  const [form, setForm] = useState(getInitialFormValues(initialValues));
  const [illustration, setIllustration] = useState(null);
  const [video, setVideo] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, illustration, video });
  };

  // On prépare le message d'erreur AVANT le return, avec un if classique
  let errorMessage = null;
  if (error) {
    errorMessage = <p className="form-error">{error}</p>;
  }

  // On prépare le texte du bouton AVANT le return, avec un if/else classique
  let buttonText = 'Enregistrer';
  if (submitting) {
    buttonText = 'Enregistrement...';
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="name">Nom</label>
        <input id="name" name="name" placeholder="Ex : Squat" value={form.name} onChange={handleChange} />
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          placeholder="Explique comment réaliser l'exercice..."
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="category">Catégorie</label>
        <select id="category" name="category" value={form.category} onChange={handleChange}>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="level">Niveau</label>
        <select id="level" name="level" value={form.level} onChange={handleChange}>
          {LEVEL_OPTIONS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="illustration">Illustration (image, optionnel)</label>
        <input
          id="illustration"
          type="file"
          accept="image/*"
          onChange={(e) => setIllustration(e.target.files[0])}
        />
      </div>

      <div>
        <label htmlFor="video">Vidéo de démonstration (optionnel)</label>
        <input id="video" type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} />
      </div>

      {errorMessage}

      <button type="submit" disabled={submitting}>
        {buttonText}
      </button>
    </form>
  );
}

export default ExerciseForm;
