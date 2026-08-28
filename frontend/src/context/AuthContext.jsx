import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger l'utilisateur au démarrage si token existe
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    if (authService.isAuthenticated()) {
      try {
        const userData = await authService.getProfile();
        setUser(userData);
      } catch (err) {
        console.error('Failed to load user:', err);
        authService.logout();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      setError(null);
      await authService.login(email, password);
      const userData = await authService.getProfile();
      setUser(userData);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Inscription d'un nouvel utilisateur
  const register = async (userData) => {
    try {
      setError(null);
      await authService.register(userData);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const updated = await authService.updateProfile(userData);
      setUser((prev) => ({ ...prev, ...updated }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  
  let isAuthenticated = false;
  if (user) {
    isAuthenticated = true;
  }

  // Calculé ici une seule fois pour éviter de recopier le même test dans chaque composant
  // (Sidebar, NavLinks, Dashboard, pages séances...).
  let isCoach = false;
  if (user && user.roles && user.roles.includes('ROLE_COACH')) {
    isCoach = true;
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    updateProfile,
    logout,
    isAuthenticated,
    isCoach,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
