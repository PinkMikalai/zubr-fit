import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import EditProfileForm from '../components/profile/EditProfileForm';
import ProfileInfoCard from '../components/profile/ProfileInfoCard';

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

  const editButton = (
    <button onClick={() => setIsEditing(true)} className="button-warning">Modifier mon profil</button>
  );

  return (
    <div className="profile-page">
      <h1>Mon profil</h1>
      <ProfileInfoCard user={user} roleLabel={getRoleLabel(user.roles)} actions={editButton} />
    </div>
  );
}

export default ProfilePage;
