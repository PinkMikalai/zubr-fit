import { useAuth } from '../hooks/useAuth';
import CoachDashboard from '../components/dashboard/CoachDashboard';
import ClientDashboard from '../components/dashboard/ClientDashboard';
import PageMeta from '../components/layout/PageMeta';

const DashboardPage = () => {
  const { user, loading, isCoach } = useAuth();

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (!user) {
    return null;
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
