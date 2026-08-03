import { Link } from 'react-router-dom';
import usersIcon from '../../assets/icons/users.svg';
import { getLevelLabel } from '../../utils/exerciseLabels';

// Formatte une date "2026-07-20 10:00:00" en "20/07/2026"
function formatDate(sqlDate) {
  if (!sqlDate) {
    return '—';
  }
  const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return formatter.format(new Date(sqlDate.replace(' ', 'T')));
}

function SeanceCard({ seance }) {
  // On prépare le statut à afficher AVANT le return, avec un if/else classique.
  // Si la séance est terminée, on affiche aussi la date à laquelle elle l'a été.
  let statusLabel = 'En cours';
  if (seance.completedAt) {
    statusLabel = `Terminée le ${formatDate(seance.completedAt)}`;
  }

  // Le niveau est optionnel : on ne l'affiche que s'il a été renseigné
  let levelTag = null;
  if (seance.level) {
    levelTag = <span className="seance-card-level">{getLevelLabel(seance)}</span>;
  }

  // Le nombre de clients assignés n'est renvoyé que par la liste des séances (pas par le détail),
  // donc on vérifie qu'il existe avant de l'afficher
  let assigneeCount = null;
  if (seance.assigneeCount !== undefined) {
    assigneeCount = (
      <p className="seance-card-assignees">
        <img src={usersIcon} alt="" />
        {seance.assigneeCount} client(s) assigné(s)
      </p>
    );
  }

  return (
    <div className="seance-card card">
      <h3>
        <Link to={`/seances/${seance.id}`}>{seance.name}</Link>
      </h3>
      <p>{seance.duration} min · {statusLabel} {levelTag}</p>
      {assigneeCount}
    </div>
  );
}

export default SeanceCard;
