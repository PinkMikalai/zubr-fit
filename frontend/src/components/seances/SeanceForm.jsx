import { useState } from 'react';

function getInitialFormValues(initialValues) {
  if (!initialValues) {
    return { name: '', duration: '', comment: '' };
  }

  let comment = initialValues.comment;
  if (!comment) {
    comment = '';
  }

  return {
    name: initialValues.name,
    duration: initialValues.duration,
    comment: comment,
  };
}

function SeanceForm({ initialValues, onSubmit, submitting, error }) {
  const [form, setForm] = useState(getInitialFormValues(initialValues));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

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
