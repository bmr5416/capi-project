import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFunMode } from '../../contexts/FunModeContext';
import { funModeMessages } from '../../data/funModeMessages';
import Card from './Card';
import styles from './LoadingAnimation.module.css';

/**
 * LoadingAnimation - Displays a loading spinner with optional messages.
 *
 * In Fun Mode: Shows quest-style rotating messages with pixel spinner,
 *              plus a separate card displaying dark humor "sayings".
 * In Normal Mode: Shows a clean, minimal spinner only.
 */
export default function LoadingAnimation({
  phrases,
  interval = 3000,
  className = '',
}) {
  const { funMode } = useFunMode();

  // Only show quest messages in Fun Mode (or if custom phrases provided)
  const showMessages = funMode || phrases;
  const activePhrases = showMessages
    ? (phrases || funModeMessages.loading)
    : null;

  // Sayings are shown in a separate card, only in Fun Mode
  const sayings = funMode ? funModeMessages.sayings : null;

  // Quest message state
  const [currentIndex, setCurrentIndex] = useState(() =>
    activePhrases ? Math.floor(Math.random() * activePhrases.length) : 0
  );
  const [isAnimating, setIsAnimating] = useState(false);

  // Sayings state (separate rotation)
  const [sayingIndex, setSayingIndex] = useState(() =>
    sayings ? Math.floor(Math.random() * sayings.length) : 0
  );
  const [sayingAnimating, setSayingAnimating] = useState(false);

  // Reset indices when fun mode toggled
  useEffect(() => {
    if (activePhrases) {
      setCurrentIndex(Math.floor(Math.random() * activePhrases.length));
    }
    if (sayings) {
      setSayingIndex(Math.floor(Math.random() * sayings.length));
    }
  }, [funMode, activePhrases, sayings]);

  // Quest message rotation timer
  useEffect(() => {
    if (!showMessages || !activePhrases) return;

    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activePhrases.length);
        setIsAnimating(false);
      }, 175);
    }, interval);

    return () => clearInterval(timer);
  }, [showMessages, activePhrases, interval]);

  // Sayings rotation timer (longer interval for longer text)
  useEffect(() => {
    if (!sayings) return;

    const timer = setInterval(() => {
      setSayingAnimating(true);
      setTimeout(() => {
        setSayingIndex((prev) => (prev + 1) % sayings.length);
        setSayingAnimating(false);
      }, 175);
    }, interval * 1.5); // 4.5s default - longer to read

    return () => clearInterval(timer);
  }, [sayings, interval]);

  return (
    <div className={`${styles.container} ${funMode ? styles.funMode : ''} ${className}`}>
      <div className={`${styles.spinner} ${funMode ? styles.pixelSpinner : ''}`} aria-hidden="true" />
      {showMessages && activePhrases && (
        <div className={styles.textWrapper}>
          <span
            className={`${styles.text} ${isAnimating ? styles.slideOut : styles.slideIn}`}
            aria-live="polite"
          >
            {activePhrases[currentIndex]}
          </span>
        </div>
      )}
      {sayings && (
        <Card className={styles.sayingsCard} padding="md">
          <p
            className={`${styles.saying} ${sayingAnimating ? styles.slideOut : styles.slideIn}`}
            aria-live="polite"
          >
            {sayings[sayingIndex]}
          </p>
        </Card>
      )}
    </div>
  );
}

LoadingAnimation.propTypes = {
  phrases: PropTypes.arrayOf(PropTypes.string),
  interval: PropTypes.number,
  className: PropTypes.string,
};
