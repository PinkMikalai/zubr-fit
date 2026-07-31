const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginForm({ email, password }) {
  const errors = {};

  // On vérifie d'abord que l'email existe avant d'appeler .trim() dessus,
  // pour ne jamais planter si email est vide ou non défini
  if (!email) {
    errors.email = "L'email est requis";
  } else if (email.trim() === '') {
    errors.email = "L'email est requis";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "L'email n'est pas valide";
  }

  if (!password) {
    errors.password = 'Le mot de passe est requis';
  }

  return errors;
}

export function validateRegisterForm({ email, password, confirmPassword, firstname, lastname, role }) {
  const errors = validateLoginForm({ email, password });

  if (password) {
    if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Merci de confirmer le mot de passe';
  } else if (password && confirmPassword !== password) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas';
  }

  if (!firstname) {
    errors.firstname = 'Le prénom est requis';
  } else if (firstname.trim() === '') {
    errors.firstname = 'Le prénom est requis';
  }

  if (!lastname) {
    errors.lastname = 'Le nom est requis';
  } else if (lastname.trim() === '') {
    errors.lastname = 'Le nom est requis';
  }

  if (!role) {
    errors.role = 'Le rôle est requis';
  }

  return errors;
}

// Contrairement à l'inscription, le mot de passe est optionnel ici : on ne le valide
// que si l'utilisateur a choisi d'en saisir un nouveau.
export function validateEditProfileForm({ email, password, confirmPassword, firstname, lastname }) {
  const errors = {};

  if (!email) {
    errors.email = "L'email est requis";
  } else if (email.trim() === '') {
    errors.email = "L'email est requis";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "L'email n'est pas valide";
  }

  if (!firstname) {
    errors.firstname = 'Le prénom est requis';
  } else if (firstname.trim() === '') {
    errors.firstname = 'Le prénom est requis';
  }

  if (!lastname) {
    errors.lastname = 'Le nom est requis';
  } else if (lastname.trim() === '') {
    errors.lastname = 'Le nom est requis';
  }

  if (password) {
    if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Merci de confirmer le mot de passe';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
  }

  return errors;
}
