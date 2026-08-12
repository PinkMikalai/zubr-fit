import { useAuth } from '../hooks/useAuth';
import CoachDashboard from '../components/dashboard/CoachDashboard';
import ClientDashboard from '../components/dashboard/ClientDashboard';
import PageMeta from '../components/layout/PageMeta';

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
    return (
      <>
        <PageMeta title="Tableau de bord" />
        <CoachDashboard user={user} />
      </>
    );
  }
  return (
    <>
      <PageMeta title="Tableau de bord" />
      <ClientDashboard user={user} />
    </>
  );
};

export default DashboardPage;
