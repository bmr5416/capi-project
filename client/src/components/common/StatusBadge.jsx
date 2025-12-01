import { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './StatusBadge.module.css';

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'gray' },
  in_progress: { label: 'In Progress', color: 'blue' },
  pending_review: { label: 'Pending Review', color: 'yellow' },
  completed: { label: 'Completed', color: 'green' },
  needs_attention: { label: 'Needs Attention', color: 'orange' },
  error: { label: 'Error', color: 'red' },
};

function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;

  return (
    <span
      className={`${styles.badge} ${styles[config.color]} ${styles[size]}`}
      role="status"
    >
      <span className={styles.dot} />
      {config.label}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.oneOf([
    'not_started',
    'in_progress',
    'pending_review',
    'completed',
    'needs_attention',
    'error',
  ]).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default memo(StatusBadge);
