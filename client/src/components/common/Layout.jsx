import { Outlet, NavLink, Link } from 'react-router-dom';
import Icon from './Icon';
import SettingsBar from './SettingsBar';
import Imp from '../imp/Imp';
import styles from './Layout.module.css';

export default function Layout() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Link to="/">
            <span className={styles.logoIcon}>C</span>
            <span className={styles.logoText}>CAPI Center</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <span className={styles.navLabel}>Main</span>
            <NavLink
              to="/"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              end
            >
              <Icon name="dashboard" className={styles.navIcon} />
              Dashboard
            </NavLink>
            <NavLink
              to="/clients/new"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <Icon name="plus" className={styles.navIcon} />
              New Client
            </NavLink>
            <NavLink
              to="/docs"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <Icon name="docs" className={styles.navIcon} />
              Documentation
            </NavLink>
          </div>

          <div className={styles.navSection}>
            <span className={styles.navLabel}>Resources</span>
            <a
              href="https://developers.facebook.com/docs/marketing-api/conversions-api"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navLink}
            >
              <Icon name="external" className={styles.navIcon} />
              Meta Docs
            </a>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <SettingsBar />
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Imp assistant - only visible in Fun Mode */}
      <Imp />
    </div>
  );
}
