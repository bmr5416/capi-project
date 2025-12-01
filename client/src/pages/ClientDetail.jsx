import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useClient } from '../hooks/useClients';
import { useMinLoadingTime } from '../hooks/useMinLoadingTime';
import { PLATFORMS } from '../data/platforms';
import { TOTAL_WIZARD_PHASES } from '../data/wizardSteps';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import ProgressBar from '../components/common/ProgressBar';
import LoadingAnimation from '../components/common/LoadingAnimation';
import styles from './ClientDetail.module.css';
import anim from '../styles/animations.module.css';

export default function ClientDetail() {
  const { clientId } = useParams();
  const { client, loading, error, addPlatform } = useClient(clientId);
  const showLoading = useMinLoadingTime(loading);
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);

  if (showLoading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!client) {
    return <div className={styles.error}>Client not found</div>;
  }

  const existingPlatforms = client.platforms?.map((p) => p.platform) || [];
  const availablePlatforms = PLATFORMS.filter(
    (p) => !existingPlatforms.includes(p.id)
  );

  const handleAddPlatform = async (platformId) => {
    await addPlatform(platformId);
    setShowPlatformPicker(false);
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={`${styles.backLink} ${anim.fadeIn}`}>← Back to Dashboard</Link>

      <header className={`${styles.header} ${anim.slideUp}`}>
        <div className={styles.clientInfo}>
          <h1>{client.name}</h1>
          <p className={styles.email}>{client.email}</p>
        </div>
        <StatusBadge status={client.status} size="lg" />
      </header>

      {client.notes && (
        <Card className={`${styles.notesCard} ${anim.slideUpDelay1}`}>
          <strong>Notes:</strong> {client.notes}
        </Card>
      )}

      <section className={`${styles.section} ${anim.slideUpDelay1}`}>
        <div className={styles.sectionHeader}>
          <h2>Platform Integrations</h2>
          {availablePlatforms.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPlatformPicker(!showPlatformPicker)}
            >
              + Add Platform
            </Button>
          )}
        </div>

        {showPlatformPicker && (
          <Card className={styles.platformPicker}>
            <h3>Select a Platform</h3>
            <div className={styles.platformGrid}>
              {availablePlatforms.map((platform) => (
                <button
                  key={platform.id}
                  className={styles.platformOption}
                  onClick={() => handleAddPlatform(platform.id)}
                >
                  {platform.logo && (
                    <img
                      src={platform.logo}
                      alt={platform.name}
                      className={styles.platformIcon}
                    />
                  )}
                  <span className={styles.platformName}>{platform.name}</span>
                  <span className={styles.platformCategory}>{platform.category}</span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {client.platforms?.length === 0 ? (
          <Card className={anim.scaleIn}>
            <div className={styles.empty}>
              <p>No platforms configured yet</p>
              <p className={styles.emptyHint}>Add a platform to start the setup wizard</p>
            </div>
          </Card>
        ) : (
          <div className={styles.platformList}>
            {client.platforms?.map((platform, index) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                clientId={clientId}
                progress={client.progress}
                delay={index}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PlatformCard({ platform, clientId, progress, delay = 0 }) {
  const platformInfo = PLATFORMS.find((p) => p.id === platform.platform);
  const platformProgress = progress?.filter((p) => p.platform === platform.platform) || [];
  const completedSteps = platformProgress.filter((p) => p.status === 'completed').length;
  const progressPercent = (completedSteps / TOTAL_WIZARD_PHASES) * 100;

  const delayClass = anim[`scaleInDelay${Math.min(delay, 2)}`] || anim.scaleIn;

  return (
    <Card className={`${styles.platformCard} ${delayClass}`}>
      <div className={styles.platformHeader}>
        <div className={styles.platformInfo}>
          {platformInfo?.logo ? (
            <img
              src={platformInfo.logo}
              alt={platformInfo.name}
              className={styles.platformIcon}
            />
          ) : (
            <span className={styles.platformIconFallback}>P</span>
          )}
          <div>
            <h3>{platformInfo?.name || platform.platform}</h3>
            <span className={styles.platformCategory}>
              {platformInfo?.category || 'Platform'}
            </span>
          </div>
        </div>
        <StatusBadge status={platform.status} size="sm" />
      </div>

      <div className={styles.platformProgress}>
        <div className={styles.progressLabel}>
          <span>Setup Progress</span>
          <span>{completedSteps}/{TOTAL_WIZARD_PHASES} steps</span>
        </div>
        <ProgressBar
          value={progressPercent}
          size="md"
          color={progressPercent === 100 ? 'success' : 'primary'}
        />
      </div>

      <div className={styles.platformActions}>
        <Button
          to={`/wizard/${clientId}/${platform.platform}`}
          variant={platform.status === 'completed' ? 'secondary' : 'primary'}
          size="sm"
        >
          {platform.status === 'not_started' && 'Start Setup'}
          {platform.status === 'in_progress' && 'Continue Setup'}
          {platform.status === 'completed' && 'View Details'}
        </Button>
      </div>
    </Card>
  );
}

PlatformCard.propTypes = {
  platform: PropTypes.shape({
    id: PropTypes.string,
    platform: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  clientId: PropTypes.string.isRequired,
  progress: PropTypes.arrayOf(
    PropTypes.shape({
      platform: PropTypes.string,
      status: PropTypes.string,
    })
  ),
  delay: PropTypes.number,
};
