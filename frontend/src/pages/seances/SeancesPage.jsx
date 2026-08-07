import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeances } from '../../hooks/useSeances';
import { useAuth } from '../../hooks/useAuth';
import SeanceCard from '../../components/seances/SeanceCard';
import { LEVEL_OPTIONS } from '../../utils/exerciseLabels';

function SeancesPage() {
  const { seances, loading, error, remove } = useSeances();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('');

  if (loading) {
    return <p>Chargement...</p>;
  }

  let isCoach = false;
  if (user && user.roles && user.roles.includes('ROLE_COACH')) {
    isCoach = true;
  }

  let visibleSeances = seances;

  // Par statut (en cours / terminée)
  if (statusFilter === 'ongoing') {
    visibleSeances = visibleSeances.filter((seance) => !seance.completedAt);
  } else if (statusFilter === 'completed') {
    visibleSeances = visibleSeances.filter((seance) => seance.completedAt);
  }

  // Et enfin par niveau de difficulté
  if (levelFilter) {
    visibleSeances = visibleSeances.filter((seance) => seance.level === levelFilter);
  }

  let errorMessage = null;
  if (error) {
    errorMessage = <p className="form-error">{error}</p>;
  }

  // La description change selon le rôle : un coach gère ses séances, un client les consulte
  let description = "Consulte tes séances d'entraînement, en cours et déjà terminées.";
  if (isCoach) {
    description = "Gère les séances que tu as créées pour tes clients.";
  }

  let newSeanceLink = null;
  if (isCoach) {
    newSeanceLink = <Link to="/seances/new" className="button-primary">Nouvelle séance</Link>;
  }

  let content;
  if (seances.length === 0) {
    content = <p>Aucune séance pour l'instant.</p>;
  } else if (visibleSeances.length === 0) {
    content = <p>Aucune séance ne correspond à ce filtre.</p>;
  } else {
    content = (
      <ul className="seance-list">
        {visibleSeances.map((seance) => {
          let onDelete = null;
          if (isCoach) {
            onDelete = () => remove(seance.id);
          }

          return (
            <li key={seance.id}>
              <SeanceCard seance={seance} onDelete={onDelete} />
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div>
      <div className="seances-page-header">
        <div>
          <h1>Mes séances</h1>
          <p className="page-description">{description}</p>
        </div>
        {newSeanceLink}
      </div>

      <div className="seance-filter-bar">
        <div className="seance-filter-group">
          <label htmlFor="statusFilter">Statut</label>
          <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tous</option>
            <option value="ongoing">En cours</option>
            <option value="completed">Terminée</option>
          </select>
        </div>

        <div className="seance-filter-group">
          <label htmlFor="levelFilter">Niveau</label>
          <select id="levelFilter" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="">Tous les niveaux</option>
            {LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {errorMessage}
      {content}
    </div>
  );
}

export default SeancesPage;
