import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { validateEditProfileForm } from '../../utils/validators/validateAuthForm';
import userIcon from '../../assets/icons/user.svg';
import mailIcon from '../../assets/icons/mail.svg';
import phoneIcon from '../../assets/icons/phone.svg';
import lockIcon from '../../assets/icons/lock.svg';
import cameraIcon from '../../assets/icons/camera.svg';

const API_URL = import.meta.env.VITE_API_URL;

function getInitialForm(user) {
  let phoneNumber = user.phoneNumber;
  if (!phoneNumber) {
    phoneNumber = '';
  }

  return {
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    phoneNumber: phoneNumber,
    password: '',
    confirmPassword: '',
  };
}

function EditProfileForm({ user, onCancel, onSaved }) {
  const { updateProfile, error } = useAuth();
  const [form, setForm] = useState(getInitialForm(user));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

    const validationErrors = validateEditProfileForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    const success = await updateProfile({
      firstname: form.firstname,
      lastname: form.lastname,
      email: form.email,
      phoneNumber: form.phoneNumber,
      password: form.password,
      avatar: avatarFile,
    });
    setSubmitting(false);

    if (success) {
      onSaved();
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

  let apiErrorMessage = null;
  if (error) {
    apiErrorMessage = <p className="form-error">{error}</p>;
  }

  // On prépare l'avatar affiché dans le bouton photo AVANT le return, avec un if/else classique
  let avatarButtonContent;
  if (avatarPreview) {
    avatarButtonContent = <img src={avatarPreview} alt="Aperçu de la photo de profil" className="avatar-preview" />;
  } else if (user.avatarUrl) {
    avatarButtonContent = <img src={`${API_URL}${user.avatarUrl}`} alt="" className="avatar-preview" />;
  } else {
    avatarButtonContent = <img src={cameraIcon} alt="" />;
  }

  let buttonText = 'Enregistrer';
  if (submitting) {
    buttonText = 'Enregistrement...';
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card profile-section-card">
      <div className="avatar-upload">
        <label htmlFor="avatar" className="avatar-upload-button">
          {avatarButtonContent}
        </label>
        <input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} hidden />
        <p>Changer la photo</p>
      </div>

      <div>
        <label htmlFor="firstname">Prénom</label>
        <div className="input-with-icon">
          <img src={userIcon} alt="" className="input-icon" />
          <input id="firstname" name="firstname" value={form.firstname} onChange={handleChange} />
        </div>
        {firstnameErrorMessage}
      </div>

      <div>
        <label htmlFor="lastname">Nom</label>
        <div className="input-with-icon">
          <img src={userIcon} alt="" className="input-icon" />
          <input id="lastname" name="lastname" value={form.lastname} onChange={handleChange} />
        </div>
        {lastnameErrorMessage}
      </div>

      <div>
        <label htmlFor="email">Adresse e-mail</label>
        <div className="input-with-icon">
          <img src={mailIcon} alt="" className="input-icon" />
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
        </div>
        {emailErrorMessage}
      </div>

      <div>
        <label htmlFor="phoneNumber">Téléphone (optionnel)</label>
        <div className="input-with-icon">
          <img src={phoneIcon} alt="" className="input-icon" />
          <input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
        </div>
      </div>

      <div>
        <label htmlFor="password">Nouveau mot de passe (optionnel)</label>
        <div className="input-with-icon">
          <img src={lockIcon} alt="" className="input-icon" />
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Laisse vide pour ne pas le changer"
            value={form.password}
            onChange={handleChange}
          />
        </div>
        {passwordErrorMessage}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
        <div className="input-with-icon">
          <img src={lockIcon} alt="" className="input-icon" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>
        {confirmPasswordErrorMessage}
      </div>

      {apiErrorMessage}

      <div className="profile-edit-actions">
        <button type="submit" disabled={submitting}>{buttonText}</button>
        <button type="button" onClick={onCancel} className="button-secondary" disabled={submitting}>
          Annuler
        </button>
      </div>
    </form>
  );
}

export default EditProfileForm;
