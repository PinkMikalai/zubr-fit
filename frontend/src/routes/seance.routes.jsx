import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import CoachRoute from '../components/CoachRoute';
import SeancesPage from '../pages/seances/SeancesPage';
import SeanceCreatePage from '../pages/seances/SeanceCreatePage';
import SeanceFormPage from '../pages/seances/SeanceFormPage';
import SeanceDetailPage from '../pages/seances/SeanceDetailPage';

// La liste et le détail d'une séance sont accessibles aux coachs ET aux clients
// (chacun voit les séances auxquelles il est lié). La création et l'édition,
// elles, sont réservées aux coachs.
const seanceRoutes = [
  <Route
    key="seances"
    path="/seances"
    element={
      <ProtectedRoute>
        <SeancesPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="seances-new"
    path="/seances/new"
    element={
      <ProtectedRoute>
        <CoachRoute>
          <SeanceCreatePage />
        </CoachRoute>
      </ProtectedRoute>
    }
  />,
  <Route
    key="seances-edit"
    path="/seances/:id/edit"
    element={
      <ProtectedRoute>
        <CoachRoute>
          <SeanceFormPage />
        </CoachRoute>
      </ProtectedRoute>
    }
  />,
  <Route
    key="seances-detail"
    path="/seances/:id"
    element={
      <ProtectedRoute>
        <SeanceDetailPage />
      </ProtectedRoute>
    }
  />,
];

export default seanceRoutes;
