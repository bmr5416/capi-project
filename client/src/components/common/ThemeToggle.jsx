import { useTheme } from '../../contexts/ThemeContext';
import Icon from './Icon';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={`${styles.iconWrapper} ${isDark ? styles.hidden : ''}`}>
        <Icon name="sun" size={18} />
      </span>
      <span className={`${styles.iconWrapper} ${isDark ? '' : styles.hidden}`}>
        <Icon name="moon" size={18} />
      </span>
    </button>
  );
}
