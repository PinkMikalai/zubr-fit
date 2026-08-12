import { useTheme } from '../../hooks/useTheme';
import sunIcon from '../../assets/icons/sun.svg';
import moonIcon from '../../assets/icons/moon.svg';

// Bouton rond qui bascule entre thème clair et sombre, réutilisé dans DesktopHeader et MobileHeader.
// L'icône affichée est celle du thème VERS lequel on va basculer (soleil = "passer en clair").
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  let icon = moonIcon;
  let label = 'Passer en mode sombre';
  if (theme === 'dark') {
    icon = sunIcon;
    label = 'Passer en mode clair';
  }

  return (
    <button type="button" onClick={toggleTheme} className="icon-button theme-toggle" aria-label={label}>
      <img src={icon} alt="" />
    </button>
  );
}

export default ThemeToggle;
