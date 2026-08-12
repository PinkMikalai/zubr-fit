import { Route } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import GuestRoute from '../components/GuestRoute';

const authRoutes = [
  <Route
    key="login"
    path="/login"
    element={
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    }
  />,
  <Route
    key="register"
    path="/register"
    element={
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    }
  />,
];

export default authRoutes;
