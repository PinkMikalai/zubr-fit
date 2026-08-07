import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import userService from '../services/userService';
import seanceService from '../services/seanceService';
import SeanceCard from '../components/seances/SeanceCard';
import userIcon from '../assets/icons/user.svg';
import mailIcon from '../assets/icons/mail.svg';
import phoneIcon from '../assets/icons/phone.svg';

const API_URL = import.meta.env.VITE_API_URL;

function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    userService
      .getById(id)
      .then(setClient)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    seanceService.getByClientId(id).then(setSeances);
  }, [id]);

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  if (!client) {
    return null;
  }

  // On sépare les séances en cours des séances terminées, avec un if/else classique
  const ongoingSeances = seances.filter((seance) => !seance.completedAt);
  const completedSeances = seances.filter((seance) => seance.completedAt);

  let seancesSection;
  if (seances.length === 0) {
    seancesSection = <p className="hint">Ce client n'a pas encore de séance.</p>;
  } else {
    let ongoingList = <p className="hint">Aucune séance en cours.</p>;
    if (ongoingSeances.length > 0) {
      ongoingList = (
        <ul className="seance-list">
          {ongoingSeances.map((seance) => (
            <li key={seance.id}>
              <SeanceCard seance={seance} />
            </li>
          ))}
        </ul>
      );
    }

    let completedList = <p className="hint">Aucune séance terminée pour l'instant.</p>;
    if (completedSeances.length > 0) {
      completedList = (
        <ul className="seance-list">
          {completedSeances.map((seance) => (
            <li key={seance.id}>
              <SeanceCard seance={seance} />
            </li>
          ))}
        </ul>
      );
    }

    seancesSection = (
      <>
        <h4 className="client-detail-seances-subtitle">En cours ({ongoingSeances.length})</h4>
        {ongoingList}

        <h4 className="client-detail-seances-subtitle">Terminées ({completedSeances.length})</h4>
        {completedList}
      </>
    );
  }

  // On prépare l'avatar AVANT le return, avec un if/else classique
  let avatarSrc = userIcon;
  if (client.avatarUrl) {
    avatarSrc = `${API_URL}${client.avatarUrl}`;
  }

  // On prépare le téléphone à afficher AVANT le return, avec un if classique
  let phoneDisplay = client.phoneNumber;
  if (!phoneDisplay) {
    phoneDisplay = 'Non renseigné';
  }

  return (
    <div className="profile-page">
      <Link to="/clients" className="button-secondary client-detail-back">Retour aux clients</Link>

      <div className="card profile-photo-card">
        <img src={avatarSrc} alt="" className="avatar-circle profile-avatar" />
        <h2>{client.firstname} {client.lastname}</h2>
        <p className="profile-role">Client</p>
      </div>

      <div className="card profile-section-card">
        <h3 className="profile-section-title">Coordonnées</h3>

        <div className="profile-detail-row">
          <img src={mailIcon} alt="" />
          <span>{client.email}</span>
        </div>

        <div className="profile-detail-row">
          <img src={phoneIcon} alt="" />
          <span>{phoneDisplay}</span>
        </div>
      </div>

      <div className="card profile-section-card">
        <h3 className="profile-section-title">Séances</h3>
        {seancesSection}
      </div>
    </div>
  );
}

export default ClientDetailPage;
