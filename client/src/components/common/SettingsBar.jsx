import FunModeToggle from './FunModeToggle';
import styles from './SettingsBar.module.css';

export default function SettingsBar() {
  return (
    <div className={styles.bar}>
      <FunModeToggle />
    </div>
  );
}
