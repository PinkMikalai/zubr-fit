import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const STORAGE_KEY = 'theme';

// Au premier chargement : on regarde si l'utilisateur a déjà choisi un thème (localStorage),
// sinon on suit la préférence du système (clair/sombre), comme avant.
function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  // On pose l'attribut data-theme sur <html> : c'est lui que le CSS (variables.css) lit
  // pour appliquer les bonnes couleurs, et on retient le choix pour la prochaine visite.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const value = { theme, toggleTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
