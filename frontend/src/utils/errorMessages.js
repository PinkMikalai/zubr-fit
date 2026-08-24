// Messages techniques renvoyés par le backend (souvent en anglais, générés automatiquement
// par des bibliothèques comme Lexik JWT) qu'on traduit ici en français pour l'utilisateur.
// Si on tombe un jour sur un nouveau message anglais oublié, il suffit d'ajouter une ligne ici.
const ERROR_MESSAGES = {
  'Invalid credentials.': 'Email ou mot de passe incorrect',
  'Invalid JWT Token': 'Session invalide, merci de vous reconnecter',
  'JWT Token not found': 'Vous devez être connecté pour accéder à cette page',
  'Expired JWT Token': 'Votre session a expiré, merci de vous reconnecter',
  'This email is already registered': 'Cette adresse e-mail est déjà utilisée',
  'Email already registered': 'Cette adresse e-mail est déjà utilisée',
};

// Renvoie le message français correspondant si on le connaît,
// sinon on renvoie le message d'origine tel quel (mieux vaut ça que rien afficher)
export function translateErrorMessage(message) {
  const translated = ERROR_MESSAGES[message];

  if (translated) {
    return translated;
  }

  return message;
}
