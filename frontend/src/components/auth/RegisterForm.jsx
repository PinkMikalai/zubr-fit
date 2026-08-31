import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validateRegisterForm } from '../../utils/validators/validateAuthForm';
import userIcon from '../../assets/icons/user.svg';
import mailIcon from '../../assets/icons/mail.svg';
import phoneIcon from '../../assets/icons/phone.svg';
import lockIcon from '../../assets/icons/lock.svg';
import cameraIcon from '../../assets/icons/camera.svg';
import dumbbellIcon from '../../assets/icons/dumbbell.svg';

const initialForm = {
  email: '',
  password: '',
  confirmPassword: '',
  firstname: '',
  lastname: '',
  phoneNumber: '',
  role: 'coach',
  acceptTerms: false,
};

// Renvoie la classe CSS d'un bouton de rôle, "actif" ou pas, avec un if/else classique
function getRoleButtonClass(selectedRole, buttonRole) {
  if (selectedRole === buttonRole) {
    return 'role-button role-button-active';
  }
  return 'role-button';
}

function RegisterForm() {
  const { register, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectRole = (role) => {
    setForm({ ...form, role: role });
  };

  const toggleAcceptTerms = (e) => {
    setForm({ ...form, acceptTerms: e.target.checked });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);

    // S'il y a au moins une erreur de validation, on arrête ici
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    const success = await register({
      email: form.email,
      password: form.password,
      firstname: form.firstname,
      lastname: form.lastname,
      phoneNumber: form.phoneNumber,
      role: form.role,
      avatar: avatarFile,
    });
    setSubmitting(false);

    if (success) {
      navigate('/login');
    }
  };

  // On prépare chaque message d'erreur AVANT le return, avec des if classiques
  let firstnameErrorMessage = null;
  if (errors.firstname) {
    firstnameErrorMessage = <p className="form-error">{errors.firstname}</p>;
  }

  let lastnameErrorMessage = null;
  if (errors.lastname) {
    lastnameErrorMessage = <p className="form-error">{errors.lastname}</p>;
  }

  let emailErrorMessage = null;
  if (errors.email) {
    emailErrorMessage = <p className="form-error">{errors.email}</p>;
  }

  let passwordErrorMessage = null;
  if (errors.password) {
    passwordErrorMessage = <p className="form-error">{errors.password}</p>;
  }

  let confirmPasswordErrorMessage = null;
  if (errors.confirmPassword) {
    confirmPasswordErrorMessage = <p className="form-error">{errors.confirmPassword}</p>;
  }

  let acceptTermsErrorMessage = null;
  if (errors.acceptTerms) {
    acceptTermsErrorMessage = <p className="form-error">{errors.acceptTerms}</p>;
  }

  let apiErrorMessage = null;
  if (error) {
    apiErrorMessage = <p className="form-error">{error}</p>;
  }

  // On prépare le contenu du bouton photo AVANT le return, avec un if/else classique
  let avatarButtonContent;
  if (avatarPreview) {
    avatarButtonContent = <img src={avatarPreview} alt="Aperçu de la photo de profil" className="avatar-preview" />;
  } else {
    avatarButtonContent = <img src={cameraIcon} alt="" />;
  }

  // On prépare le texte du bouton de validation AVANT le return, avec un if/else classique
  let buttonText = "S'inscrire";
  if (submitting) {
    buttonText = 'Inscription...';
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <span className="field-label">Je souhaite m'inscrire en tant que :</span>
        <div className="role-toggle">
          <button type="button" className={getRoleButtonClass(form.role, 'coach')} onClick={() => selectRole('coach')}>
            <img src={dumbbellIcon} alt="" />
            <span>Coach</span>
          </button>
          <button type="button" className={getRoleButtonClass(form.role, 'client')} onClick={() => selectRole('client')}>
            <img src={userIcon} alt="" />
            <span>Client</span>
          </button>
        </div>
      </div>

      <div className="avatar-upload">
        <label htmlFor="avatar" className="avatar-upload-button">
          {avatarButtonContent}
        </label>
        <input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} hidden />
        <p>Ajouter une photo</p>
      </div>

      <div>
        <label htmlFor="firstname">Prénom</label>
        <div className="input-with-icon">
          <img src={userIcon} alt="" className="input-icon" />
          <input
            id="firstname"
            name="firstname"
            placeholder="Ex : Marie"
            value={form.firstname}
            onChange={handleChange}
          />
        </div>
        {firstnameErrorMessage}
      </div>

      <div>
        <label htmlFor="lastname">Nom</label>
        <div className="input-with-icon">
          <img src={userIcon} alt="" className="input-icon" />
          <input
            id="lastname"
            name="lastname"
            placeholder="Ex : Curie"
            value={form.lastname}
            onChange={handleChange}
          />
        </div>
        {lastnameErrorMessage}
      </div>

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
        <label htmlFor="phoneNumber">Téléphone (optionnel)</label>
        <div className="input-with-icon">
          <img src={phoneIcon} alt="" className="input-icon" />
          <input
            id="phoneNumber"
            name="phoneNumber"
            placeholder="Ex : 0612345678"
            value={form.phoneNumber}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password">Mot de passe</label>
        <div className="input-with-icon">
          <img src={lockIcon} alt="" className="input-icon" />
          <input
            id="password"
            name="password"
            type="password"
            placeholder="6 caractères, 1 majuscule, 1 chiffre"
            value={form.password}
            onChange={handleChange}
          />
        </div>
        {passwordErrorMessage}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
        <div className="input-with-icon">
          <img src={lockIcon} alt="" className="input-icon" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Retape ton mot de passe"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>
        {confirmPasswordErrorMessage}
      </div>

      <div className="accept-terms-field">
        <label className="accept-terms-label">
          <input type="checkbox" checked={form.acceptTerms} onChange={toggleAcceptTerms} />
          <span>
            J'accepte les <Link to="/terms" target="_blank">conditions d'utilisation et la politique de confidentialité</Link>
          </span>
        </label>
        {acceptTermsErrorMessage}
      </div>

      {apiErrorMessage}

      <button type="submit" disabled={submitting} className="auth-submit">
        {buttonText}
      </button>
    </form>
  );
}

export default RegisterForm;
