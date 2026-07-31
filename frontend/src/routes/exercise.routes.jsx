import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import CoachRoute from '../components/CoachRoute';
import ExercisesPage from '../pages/exercises/ExercisesPage';
import ExerciseFormPage from '../pages/exercises/ExerciseFormPage';
import ExerciseDetailPage from '../pages/exercises/ExerciseDetailPage';

// La bibliothèque d'exercices est un outil de coach (chaque exercice appartient à son créateur) :
// toutes ces pages sont donc réservées aux coachs.
const exerciseRoutes = [
  <Route
    key="exercises"
    path="/exercises"
    element={
      <ProtectedRoute>
        <CoachRoute>
          <ExercisesPage />
        </CoachRoute>
      </ProtectedRoute>
    }
  />,
  <Route
    key="exercises-new"
    path="/exercises/new"
    element={
      <ProtectedRoute>
        <CoachRoute>
          <ExerciseFormPage />
        </CoachRoute>
      </ProtectedRoute>
    }
  />,
  <Route
    key="exercises-edit"
    path="/exercises/:id/edit"
    element={
      <ProtectedRoute>
        <CoachRoute>
          <ExerciseFormPage />
        </CoachRoute>
      </ProtectedRoute>
    }
  />,
  <Route
    key="exercises-detail"
    path="/exercises/:id"
    element={
      <ProtectedRoute>
        <CoachRoute>
          <ExerciseDetailPage />
        </CoachRoute>
      </ProtectedRoute>
    }
  />,
];

export default exerciseRoutes;
