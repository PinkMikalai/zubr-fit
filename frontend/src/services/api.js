import { translateErrorMessage } from '../utils/errorMessages';
import { getToken } from '../utils/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL;

async function request(endpoint, options) {
  // Si on ne nous a pas donné d'options, on utilise un objet vide par défaut
  if (!options) {
    options = {};
  }

  let method = options.method;
  if (!method) {
    method = 'GET';
  }

  const body = options.body;

  // Le token JWT : soit on nous en passe un explicitement, soit on prend celui
  // stocké après la connexion. Comme ça, les services n'ont plus à le répéter.
  let token = options.token;
  if (!token) {
    token = getToken();
  }

  let isFormData = false;
  if (body instanceof FormData) {
    isFormData = true;
  }

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // On prépare le corps de la requête AVANT l'appel fetch, avec un if/else classique
  let requestBody;
  if (isFormData) {
    // FormData fixe elle-même son Content-Type (avec la boundary multipart) — ne pas la stringifier
    requestBody = body;
  } else if (body !== undefined) {
    requestBody = JSON.stringify(body);
  } else {
    requestBody = undefined;
  }

  const response = await fetch(`${BASE_URL}/api${endpoint}`, {
    method: method,
    headers: headers,
    body: requestBody,
  });

  // On essaie de lire le corps JSON de la réponse ; s'il n'y en a pas, on garde null
  let data = null;
  try {
    data = await response.json();
  } catch {
    // La réponse n'avait pas de corps JSON valide, on garde data = null
  }

  if (!response.ok) {
    let errorMessage = `Erreur ${response.status}`;

    // Les erreurs de validation (422) renvoient un détail par champ dans "errors" (ex: { email: "..." }) :
    // c'est ce message précis qu'il faut afficher, pas le "Validation failed" générique de "message".
    let fieldErrorMessage = null;
    if (data && data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
      const fieldMessages = Object.values(data.errors);
      if (fieldMessages.length > 0) {
        fieldErrorMessage = fieldMessages[0];
      }
    }

    if (fieldErrorMessage) {
      errorMessage = translateErrorMessage(fieldErrorMessage);
    } else if (data && data.message) {
      errorMessage = translateErrorMessage(data.message);
    }

    const error = new Error(errorMessage);
    // On garde le code HTTP sur l'erreur pour pouvoir réagir différemment selon le cas (401, 404, ...)
    error.status = response.status;
    throw error;
  }

  return data;
}

// Variante pour les endpoints qui renvoient une liste : renvoie toujours un tableau,
// même si le backend n'a rien mis dans "data".
export async function apiList(endpoint, options) {
  const data = await request(endpoint, options);
  if (!data.data) {
    return [];
  }
  return data.data;
}

export default request;
