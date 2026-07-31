import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import seanceService from '../../services/seanceService';
import seanceExerciseService from '../../services/seanceExerciseService';
import dumbbellIcon from '../../assets/icons/dumbbell.svg';
import checkIcon from '../../assets/icons/check.svg';

const API_URL = import.meta.env.VITE_API_URL;
const RING_RADIUS = 40;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Formatte une date ISO en "29 juil." (jour + mois abrégé), pour l'historique récent
function formatShortDate(isoDate) {
  const formatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
  return formatter.format(new Date(isoDate));
}

function ClientDashboard({ user }) {
  const [seances, setSeances] = useState([]);
  const [todayLines, setTodayLines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seanceService.list().then(setSeances).finally(() => setLoading(false));
  }, []);

  const pending = seances.filter((seance) => !seance.completedAt);
  const completed = seances.filter((seance) => seance.completedAt);

  let todaySeance = null;
  if (pending.length > 0) {
    todaySeance = pending[0];
  }

  useEffect(() => {
    if (!todaySeance) {
      setTodayLines([]);
      return;
    }
    seanceExerciseService.list(todaySeance.id).then(setTodayLines);
  }, [todaySeance]);

  if (loading) {
    return <p>Chargement...</p>;
  }

  let progressPercent = 0;
  if (seances.length > 0) {
    progressPercent = Math.round((completed.length / seances.length) * 100);
  }
  const ringOffset = RING_CIRCUMFERENCE - (progressPercent / 100) * RING_CIRCUMFERENCE;

  // On prépare la carte "séance du jour" AVANT le return, avec un if/else classique
  let todayCard;
  if (todaySeance) {
    let commentParagraph = null;
    if (todaySeance.comment) {
      commentParagraph = <p className="today-seance-comment">{todaySeance.comment}</p>;
    }

    todayCard = (
      <div className="card today-seance-card">
        <span className="badge today-seance-badge">Séance du jour</span>
        <h2>{todaySeance.name}</h2>
        {commentParagraph}

        <div className="today-seance-stats">
          <div>
            <p className="today-seance-stat-label">Durée estimée</p>
            <p className="today-seance-stat-value">{todaySeance.duration} min</p>
          </div>
          <div>
            <p className="today-seance-stat-label">Exercices</p>
            <p className="today-seance-stat-value">{todayLines.length}</p>
          </div>
        </div>

        <Link to={`/seances/${todaySeance.id}`} className="today-seance-cta">Voir la séance</Link>
      </div>
    );
  } else {
    todayCard = (
      <div className="card today-seance-card today-seance-empty">
        <h2>Aucune séance en attente</h2>
        <p>Toutes tes séances sont terminées, bravo !</p>
      </div>
    );
  }

  let exercisePreviewList = null;
  if (todayLines.length > 0) {
    exercisePreviewList = (
      <div className="today-exercises">
        {todayLines.slice(0, 3).map((line) => {
          let thumbnail;
          if (line.exercise.illustration) {
            thumbnail = (
              <img
                src={`${API_URL}/uploads/illustrations/${line.exercise.illustration}`}
                alt=""
                className="today-exercise-thumbnail"
              />
            );
          } else {
            thumbnail = (
              <div className="today-exercise-thumbnail today-exercise-thumbnail-placeholder">
                <img src={dumbbellIcon} alt="" />
              </div>
            );
          }

          return (
            <div key={line.id} className="card today-exercise-card">
              {thumbnail}
              <h3>{line.exercise.name}</h3>
              <p>{line.sets} sets x {line.reps} reps</p>
            </div>
          );
        })}
      </div>
    );
  }

  let historyList = null;
  if (completed.length === 0) {
    historyList = <p>Aucune séance terminée pour l'instant.</p>;
  } else {
    historyList = (
      <ul className="history-list">
        {completed.slice(0, 3).map((seance) => (
          <li key={seance.id} className="history-item">
            <span className="history-check">
              <img src={checkIcon} alt="" />
            </span>
            <div className="history-info">
              <p className="history-name">{seance.name}</p>
              <p className="history-date">{formatShortDate(seance.completedAt)} · {seance.duration} min</p>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="client-dashboard">
      <h1>Bienvenue, {user.firstname}</h1>
      <p className="page-subtitle">Aujourd'hui est un bon jour pour repousser tes limites.</p>

      <div className="client-dashboard-grid">
        <div>
          {todayCard}
          {exercisePreviewList}
        </div>

        <div className="client-dashboard-side">
          <div className="card progress-card">
            <p className="progress-card-title">Progression</p>
            <svg viewBox="0 0 100 100" className="progress-ring">
              <circle cx="50" cy="50" r={RING_RADIUS} className="progress-ring-track" />
              <circle
                cx="50"
                cy="50"
                r={RING_RADIUS}
                className="progress-ring-value"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
              />
              <text x="50" y="46" textAnchor="middle" className="progress-ring-percent">{progressPercent}%</text>
              <text x="50" y="62" textAnchor="middle" className="progress-ring-label">terminées</text>
            </svg>
            <p className="progress-card-count">{completed.length} / {seances.length} séances terminées</p>
          </div>

          <div className="card history-card">
            <div className="history-card-header">
              <p className="history-card-title">Historique récent</p>
              <Link to="/seances">Voir tout</Link>
            </div>
            {historyList}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;
