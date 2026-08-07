import { useState } from 'react';
import { LEVEL_OPTIONS } from '../../utils/exerciseLabels';
import { validateSeanceForm } from '../../utils/validators/validateSeanceForm';

function getInitialFormValues(initialValues) {
  if (!initialValues) {
    return { name: '', duration: '', comment: '', level: '' };
  }

  let comment = initialValues.comment;
  if (!comment) {
    comment = '';
  }

  let level = initialValues.level;
  if (!level) {
    level = '';
  }

  return {
    name: initialValues.name,
    duration: initialValues.duration,
    comment: comment,
    level: level,
  };
}

function SeanceForm({ initialValues, onSubmit, submitting, error }) {
  const [form, setForm] = useState(getInitialFormValues(initialValues));
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateSeanceForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSubmit(form);
  };

  // On prépare chaque message d'erreur AVANT le return, avec des if classiques
  let nameErrorMessage = null;
  if (errors.name) {
    nameErrorMessage = <p className="form-error">{errors.name}</p>;
  }

  let durationErrorMessage = null;
  if (errors.duration) {
    durationErrorMessage = <p className="form-error">{errors.duration}</p>;
  }

  let levelErrorMessage = null;
  if (errors.level) {
    levelErrorMessage = <p className="form-error">{errors.level}</p>;
  }

  let errorMessage = null;
  if (error) {
    errorMessage = <p className="form-error">{error}</p>;
  }

  let buttonText = 'Enregistrer';
  if (submitting) {
    buttonText = 'Enregistrement...';
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="name">Nom de la séance</label>
        <input id="name" name="name" placeholder="Ex : Séance jambes" value={form.name} onChange={handleChange} />
        {nameErrorMessage}
      </div>

      <div>
        <label htmlFor="duration">Durée estimée (minutes)</label>
        <input
          id="duration"
          name="duration"
          type="number"
          min="1"
          placeholder="Ex : 45"
          value={form.duration}
          onChange={handleChange}
        />
        {durationErrorMessage}
      </div>

      <div>
        <label htmlFor="level">Niveau</label>
        <select id="level" name="level" value={form.level} onChange={handleChange}>
          <option value="">Choisir un niveau...</option>
          {LEVEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {levelErrorMessage}
      </div>

      <div>
        <label htmlFor="comment">Commentaire (optionnel)</label>
        <textarea
          id="comment"
          name="comment"
          placeholder="Note pour le client (optionnel)"
          value={form.comment}
          onChange={handleChange}
        />
      </div>

      {errorMessage}

      <button type="submit" disabled={submitting}>
        {buttonText}
      </button>
    </form>
  );
}

export default SeanceForm;
