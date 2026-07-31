import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import coachClientService from '../../services/coachClientService';
import seanceService from '../../services/seanceService';

function CoachDashboard({ user }) {
  const [clients, setClients] = useState([]);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([coachClientService.list(), seanceService.list()])
      .then(([clientsData, seancesData]) => {
        setClients(clientsData);
        setSeances(seancesData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Chargement...</p>;
  }

  const completedCount = seances.filter((seance) => seance.completedAt).length;

  return (
    <div>
      <h1>Bonjour, {user.firstname} !</h1>
      <p className="page-subtitle">Voici un aperçu de ton activité de coach</p>

      <div className="dashboard-stats">
        <div className="card dashboard-stat">
          <p className="dashboard-stat-value">{clients.length}</p>
          <p className="dashboard-stat-label">Clients actifs</p>
        </div>
        <div className="card dashboard-stat">
          <p className="dashboard-stat-value">{seances.length}</p>
          <p className="dashboard-stat-label">Séances créées</p>
        </div>
        <div className="card dashboard-stat">
          <p className="dashboard-stat-value">{completedCount}</p>
          <p className="dashboard-stat-label">Séances terminées</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/seances/new" className="card dashboard-action">Nouvelle séance</Link>
        <Link to="/clients" className="card dashboard-action">Ajouter un client</Link>
        <Link to="/exercises/new" className="card dashboard-action">Nouvel exercice</Link>
      </div>
    </div>
  );
}

export default CoachDashboard;
