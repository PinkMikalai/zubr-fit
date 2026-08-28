import api, { apiList } from './api';

const userService = {
  // Liste des utilisateurs "client" potentiels (réservé aux coachs, voir backend UserSearchController).
  // query est optionnel : sans lui, on récupère tout le monde. Avec lui, on filtre par
  // nom, prénom, email ou téléphone.
  async search(query) {
    let endpoint = '/users';

    if (query) {
      endpoint = `/users?q=${encodeURIComponent(query)}`;
    }

    return apiList(endpoint);
  },

  // Le profil public d'un utilisateur précis (utilisé par la fiche "Voir profil" d'un client)
  async getById(id) {
    const data = await api(`/profile/${id}`);
    return data.data;
  },
};

export default userService;
