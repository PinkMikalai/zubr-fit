import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import ClientsPage from '../pages/ClientsPage';
import ClientDetailPage from '../pages/ClientDetailPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../components/ProtectedRoute';
import CoachRoute from '../components/CoachRoute';
import authRoutes from './auth.routes';
import exerciseRoutes from './exercise.routes';
import seanceRoutes from './seance.routes';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      {authRoutes}
      {exerciseRoutes}
      {seanceRoutes}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <CoachRoute>
              <ClientsPage />
            </CoachRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <CoachRoute>
              <ClientDetailPage />
            </CoachRoute>
          </ProtectedRoute>
        }
      />
      {/* Cette route doit toujours rester EN DERNIER : path="*" attrape toutes les URL
          qui n'ont matché aucune route au-dessus */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
