import { Link } from 'react-router-dom';

function SeanceCard({ seance }) {
  // On prépare le statut à afficher AVANT le return, avec un if/else classique
  let statusLabel = 'En cours';
  if (seance.completedAt) {
    statusLabel = 'Terminée';
  }

  return (
    <div className="seance-card card">
      <h3>
        <Link to={`/seances/${seance.id}`}>{seance.name}</Link>
      </h3>
      <p>
        {seance.duration} min · {statusLabel}
      </p>
    </div>
  );
}

export default SeanceCard;
