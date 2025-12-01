import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useClients } from '../hooks/useClients';
import { useMinLoadingTime } from '../hooks/useMinLoadingTime';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import ProgressBar from '../components/common/ProgressBar';
import LoadingAnimation from '../components/common/LoadingAnimation';
import styles from './Dashboard.module.css';
import anim from '../styles/animations.module.css';

export default function Dashboard() {
  const { clients, loading, error } = useClients();
  const showLoading = useMinLoadingTime(loading);

  const stats = useMemo(() => ({
    total: clients.length,
    completed: clients.filter((c) => c.status === 'completed').length,
    inProgress: clients.filter((c) => c.status === 'in_progress').length,
    notStarted: clients.filter((c) => c.status === 'not_started').length,
  }), [clients]);

  if (showLoading) {
    return (
      <div className={styles.container}>
        <LoadingAnimation />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={`${styles.header} ${anim.slideUp}`}>
        <div>
          <h1>Dashboard</h1>
          <p className={styles.subtitle}>Manage Meta CAPI implementations</p>
        </div>
        <Button to="/clients/new">+ Add Client</Button>
      </header>

      <div className={`${styles.stats} ${anim.slideUpDelay1}`}>
        <StatCard label="Total Clients" value={stats.total} />
        <StatCard label="Completed" value={stats.completed} color="success" />
        <StatCard label="In Progress" value={stats.inProgress} color="primary" />
        <StatCard label="Not Started" value={stats.notStarted} color="gray" />
      </div>

      <section className={`${styles.section} ${anim.slideUpDelay2}`}>
        <h2>Clients</h2>
        {clients.length === 0 ? (
          <Card>
            <div className={styles.empty}>
              <p>No clients yet</p>
              <Button to="/clients/new">Add your first client</Button>
            </div>
          </Card>
        ) : (
          <div className={styles.clientList}>
            {clients.map((client, index) => (
              <ClientCard key={client.id} client={client} delay={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, color = 'default' }) {
  return (
    <Card
      className={`${styles.statCard} ${styles[color]}`}
      role="region"
      aria-label={`${label}: ${value}`}
    >
      <div className={styles.statValue} aria-hidden="true">{value}</div>
      <div className={styles.statLabel} aria-hidden="true">{label}</div>
    </Card>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  color: PropTypes.oneOf(['default', 'success', 'primary', 'gray']),
};

function ClientCard({ client, delay = 0 }) {
  const progressPercent = client.platformCount > 0
    ? (client.completedPlatforms / client.platformCount) * 100
    : 0;

  // Stagger delay for each card (max 4 delays, then cycle)
  const delayClass = anim[`scaleInDelay${Math.min(delay, 2)}`] || anim.scaleIn;

  return (
    <Card className={`${styles.clientCard} ${delayClass}`} interactive>
      <Link to={`/clients/${client.id}`} className={styles.clientLink}>
        <div className={styles.clientHeader}>
          <div className={styles.clientInfo}>
            <h3>{client.name}</h3>
            <span className={styles.clientEmail}>{client.email}</span>
          </div>
          <StatusBadge status={client.status} size="sm" />
        </div>

        <div className={styles.clientProgress}>
          <div className={styles.progressLabel}>
            <span>Progress</span>
            <span>{client.completedPlatforms}/{client.platformCount} platforms</span>
          </div>
          <ProgressBar
            value={progressPercent}
            size="sm"
            color={progressPercent === 100 ? 'success' : 'primary'}
          />
        </div>
      </Link>
    </Card>
  );
}

ClientCard.propTypes = {
  client: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    platformCount: PropTypes.number,
    completedPlatforms: PropTypes.number,
  }).isRequired,
  delay: PropTypes.number,
};
