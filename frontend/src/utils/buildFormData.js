// Transforme un objet plat en FormData, en ignorant les champs vides.
// Sert dès qu'une requête doit envoyer un fichier (photo de profil, illustration d'exercice...).
function buildFormData(fields) {
  const formData = new FormData();
  const entries = Object.entries(fields);

  for (const [key, value] of entries) {
    if (value === undefined) {
      continue;
    }
    if (value === null) {
      continue;
    }
    if (value === '') {
      continue;
    }
    formData.append(key, value);
  }

  return formData;
}

export default buildFormData;
