import { Route } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

const authRoutes = [
  <Route key="login" path="/login" element={<LoginPage />} />,
  <Route key="register" path="/register" element={<RegisterPage />} />,
];

export default authRoutes;
