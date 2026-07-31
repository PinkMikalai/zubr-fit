import { translateErrorMessage } from '../utils/errorMessages';

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
  const token = options.token;

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
    if (data && data.message) {
      errorMessage = translateErrorMessage(data.message);
    }

    const error = new Error(errorMessage);
    // On garde le code HTTP sur l'erreur pour pouvoir réagir différemment selon le cas (401, 404, ...)
    error.status = response.status;
    throw error;
  }

  return data;
}

export default request;
