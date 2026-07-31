import { useAuth } from '../hooks/useAuth';
import CoachDashboard from '../components/dashboard/CoachDashboard';
import ClientDashboard from '../components/dashboard/ClientDashboard';

const DashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (!user) {
    return null;
  }

  let isCoach = false;
  if (user.roles && user.roles.includes('ROLE_COACH')) {
    isCoach = true;
  }

  if (isCoach) {
    return <CoachDashboard user={user} />;
  }
  return <ClientDashboard user={user} />;
};

export default DashboardPage;
