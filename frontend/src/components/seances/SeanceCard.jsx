import { Link } from 'react-router-dom';
import usersIcon from '../../assets/icons/users.svg';
import { getLevelLabel } from '../../utils/exerciseLabels';
import { formatDate } from '../../utils/formatDate';

// showAggregate : quand un coach regarde SA liste de séances, le statut est une vue
// d'ensemble ("2 / 3 clients ont terminé"). Sinon (client, ou coach qui regarde les
// séances d'UN client précis), on affiche le statut personnel de la séance.
function SeanceCard({ seance, onDelete, showAggregate }) {
  // On prépare le statut à afficher AVANT le return, avec un if/else classique.
  let statusLabel = 'En cours';
  if (showAggregate) {
    if (seance.assigneeCount === 0) {
      statusLabel = 'Aucun client assigné';
    } else {
      statusLabel = `${seance.completedCount} / ${seance.assigneeCount} client(s) ont terminé`;
    }
  } else if (seance.completedAt) {
    statusLabel = `Terminée le ${formatDate(seance.completedAt)}`;
  }

  // Le niveau est optionnel : on ne l'affiche que s'il a été renseigné
  let levelTag = null;
  if (seance.level) {
    levelTag = <span className="seance-card-level">{getLevelLabel(seance)}</span>;
  }

  // Le nombre de clients assignés : seulement dans la vue d'ensemble du coach
  let assigneeCount = null;
  if (showAggregate) {
    assigneeCount = (
      <p className="seance-card-assignees">
        <img src={usersIcon} alt="" />
        {seance.assigneeCount} client(s) assigné(s)
      </p>
    );
  }

  // Les boutons Modifier/Supprimer ne sont affichés que côté coach (voir SeancesPage),
  // et font partie de la carte elle-même plutôt que d'être un bloc séparé en dessous.
  let footer = null;
  if (onDelete) {
    footer = (
      <footer className="seance-card-footer">
        <Link to={`/seances/${seance.id}/edit`} className="button-warning">Modifier</Link>
        <button onClick={onDelete} className="button-danger">Supprimer</button>
      </footer>
    );
  }

  return (
    <article className="seance-card card">
      <header className="seance-card-header">
        <h3>
          <Link to={`/seances/${seance.id}`}>{seance.name}</Link>
        </h3>
        {levelTag}
      </header>
      <p className="seance-card-meta">{seance.duration} min · {statusLabel}</p>
      {assigneeCount}
      {footer}
    </article>
  );
}

export default SeanceCard;
