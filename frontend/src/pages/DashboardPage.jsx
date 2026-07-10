import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      
      {user && (
        <div>
          <h2>Bienvenue, {user.firstname} {user.lastname} !</h2>
          <p>Email: {user.email}</p>
        </div>
      )}

      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
};

export default DashboardPage;
