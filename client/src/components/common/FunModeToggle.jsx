import { useFunMode } from '../../contexts/FunModeContext';
import Icon from './Icon';
import styles from './FunModeToggle.module.css';

export default function FunModeToggle() {
  const { funMode, toggleFunMode } = useFunMode();

  return (
    <button
      className={`${styles.toggle} ${funMode ? styles.active : ''}`}
      onClick={toggleFunMode}
      aria-label={funMode ? 'Disable fun mode' : 'Enable fun mode'}
      title={funMode ? 'Disable fun mode' : 'Enable fun mode'}
    >
      <span className={`${styles.iconWrapper} ${funMode ? styles.hidden : ''}`}>
        <Icon name="gamepad" size={18} />
      </span>
      <span className={`${styles.iconWrapper} ${funMode ? '' : styles.hidden}`}>
        <Icon name="sparkles" size={18} />
      </span>
    </button>
  );
}
