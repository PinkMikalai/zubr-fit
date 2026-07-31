import { useState } from 'react';
import userService from '../../services/userService';
import userIcon from '../../assets/icons/user.svg';
import searchIcon from '../../assets/icons/search.svg';
import plusIcon from '../../assets/icons/plus.svg';
import checkIcon from '../../assets/icons/check.svg';

const API_URL = import.meta.env.VITE_API_URL;

function ClientSearch({ existingClientIds, onAdd }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addingId, setAddingId] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await userService.search(query);
      setResults(data);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (userId) => {
    setAddingId(userId);
    setError(null);
    try {
      await onAdd(userId);
      setResults((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingId(null);
    }
  };

  let errorMessage = null;
  if (error) {
    errorMessage = <p className="form-error">{error}</p>;
  }

  let resultsList = null;
  if (searched && results.length === 0) {
    resultsList = <p>Aucun utilisateur trouvé.</p>;
  } else if (results.length > 0) {
    resultsList = (
      <>
        <p className="client-search-count">Utilisateurs suggérés ({results.length})</p>
        <ul className="client-search-results">
          {results.map((user) => {
            let alreadyClient = false;
            if (existingClientIds.includes(user.id)) {
              alreadyClient = true;
            }

            let avatarSrc = userIcon;
            if (user.avatarUrl) {
              avatarSrc = `${API_URL}${user.avatarUrl}`;
            }

            let actionButton = null;
            if (alreadyClient) {
              actionButton = (
                <span className="icon-button icon-button-done">
                  <img src={checkIcon} alt="Déjà client" />
                </span>
              );
            } else {
              actionButton = (
                <button
                  onClick={() => handleAdd(user.id)}
                  disabled={addingId === user.id}
                  className="icon-button"
                  aria-label="Ajouter comme client"
                >
                  <img src={plusIcon} alt="" />
                </button>
              );
            }

            return (
              <li key={user.id} className="client-search-result card">
                <img src={avatarSrc} alt="" className="avatar-circle client-avatar" />
                <div className="client-info">
                  <h3>{user.firstname} {user.lastname}</h3>
                  <p>{user.email}</p>
                </div>
                {actionButton}
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  let buttonText = 'Rechercher';
  if (loading) {
    buttonText = 'Recherche...';
  }

  return (
    <div className="client-search">
      <h2>Trouver un client</h2>
      <form onSubmit={handleSearch} className="client-search-form">
        <div className="input-with-icon client-search-input">
          <img src={searchIcon} alt="" className="input-icon" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>{buttonText}</button>
      </form>

      {errorMessage}
      {resultsList}
    </div>
  );
}

export default ClientSearch;
