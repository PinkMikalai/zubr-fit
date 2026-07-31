import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import EditProfileForm from '../components/profile/EditProfileForm';
import userIcon from '../assets/icons/user.svg';
import mailIcon from '../assets/icons/mail.svg';
import phoneIcon from '../assets/icons/phone.svg';

const API_URL = import.meta.env.VITE_API_URL;

// Traduit le rôle technique (ROLE_COACH / ROLE_USER) en texte lisible, avec un if/else classique
function getRoleLabel(roles) {
  if (roles && roles.includes('ROLE_COACH')) {
    return 'Coach';
  }
  return 'Client';
}

function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return <p>Chargement...</p>;
  }

  if (isEditing) {
    return (
      <div className="profile-page">
        <h1>Modifier mon profil</h1>
        <EditProfileForm user={user} onCancel={() => setIsEditing(false)} onSaved={() => setIsEditing(false)} />
      </div>
    );
  }

  // On prépare l'avatar AVANT le return, avec un if/else classique :
  // la vraie photo si l'utilisateur en a une, sinon une icône par défaut
  let avatarSrc = userIcon;
  if (user.avatarUrl) {
    avatarSrc = `${API_URL}${user.avatarUrl}`;
  }

  // On prépare le téléphone à afficher AVANT le return, avec un if classique
  let phoneDisplay = user.phoneNumber;
  if (!phoneDisplay) {
    phoneDisplay = 'Non renseigné';
  }

  return (
    <div className="profile-page">
      <h1>Mon profil</h1>

      {/* Carte photo, comme sur la maquette : avatar + nom + rôle */}
      <div className="card profile-photo-card">
        <img src={avatarSrc} alt="Photo de profil" className="avatar-circle profile-avatar" />
        <h2>
          {user.firstname} {user.lastname}
        </h2>
        <p className="profile-role">{getRoleLabel(user.roles)}</p>
        <button onClick={() => setIsEditing(true)} className="button-secondary">Modifier mon profil</button>
      </div>

      {/* Carte coordonnées : uniquement les champs que le backend renvoie vraiment */}
      <div className="card profile-section-card">
        <h3 className="profile-section-title">Coordonnées</h3>

        <div className="profile-detail-row">
          <img src={mailIcon} alt="" />
          <span>{user.email}</span>
        </div>

        <div className="profile-detail-row">
          <img src={phoneIcon} alt="" />
          <span>{phoneDisplay}</span>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
