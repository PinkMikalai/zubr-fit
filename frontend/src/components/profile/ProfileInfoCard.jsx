import userIcon from '../../assets/icons/user.svg';
import mailIcon from '../../assets/icons/mail.svg';
import phoneIcon from '../../assets/icons/phone.svg';

const API_URL = import.meta.env.VITE_API_URL;

// Carte photo + carte coordonnées d'un utilisateur (avatar, nom, rôle, email, téléphone),
// réutilisée par ProfilePage (son propre profil, avec actions) et ClientDetailPage
// (profil d'un client, lecture seule, sans actions).
function ProfileInfoCard({ user, roleLabel, actions }) {
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
    <>
      <div className="card profile-photo-card">
        <img src={avatarSrc} alt="" className="avatar-circle profile-avatar" />
        <h2>{user.firstname} {user.lastname}</h2>
        <p className="profile-role">{roleLabel}</p>
        {actions}
      </div>

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
    </>
  );
}

export default ProfileInfoCard;
