import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validateLoginForm } from '../../utils/validators/validateAuthForm';
import mailIcon from '../../assets/icons/mail.svg';
import lockIcon from '../../assets/icons/lock.svg';

function LoginForm() {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateLoginForm(form);
    setErrors(validationErrors);

    // S'il y a au moins une erreur de validation, on arrête ici
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    const success = await login(form.email, form.password);
    setSubmitting(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  // On prépare les messages d'erreur AVANT le return, avec des if classiques
  let emailErrorMessage = null;
  if (errors.email) {
    emailErrorMessage = <p className="form-error">{errors.email}</p>;
  }

  let passwordErrorMessage = null;
  if (errors.password) {
    passwordErrorMessage = <p className="form-error">{errors.password}</p>;
  }

  let apiErrorMessage = null;
  if (error) {
    apiErrorMessage = <p className="form-error">{error}</p>;
  }

  // On prépare le texte du bouton AVANT le return, avec un if/else classique
  let buttonText = 'Se connecter';
  if (submitting) {
    buttonText = 'Connexion...';
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="email">Adresse e-mail</label>
        <div className="input-with-icon">
          <img src={mailIcon} alt="" className="input-icon" />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="nom@exemple.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        {emailErrorMessage}
      </div>

      <div>
        <label htmlFor="password">Mot de passe</label>
        <div className="input-with-icon">
          <img src={lockIcon} alt="" className="input-icon" />
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Ton mot de passe"
            value={form.password}
            onChange={handleChange}
          />
        </div>
        {passwordErrorMessage}
      </div>

      {apiErrorMessage}

      <button type="submit" disabled={submitting} className="auth-submit">
        {buttonText}
      </button>
    </form>
  );
}

export default LoginForm;
