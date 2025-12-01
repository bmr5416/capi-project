/**
 * ImpBalloon - Speech balloon component with word-by-word reveal
 * Adapted from clippyjs (MIT License)
 * Source: https://github.com/pi0/clippyjs/blob/master/lib/balloon.js
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './ImpBalloon.module.css';

// Timing constants (from original clippyjs)
const WORD_SPEAK_TIME = 200; // ms per word
const CLOSE_BALLOON_DELAY = 3000; // ms before auto-close after speaking

export default function ImpBalloon({
  text,
  isVisible,
  position = 'top-left',
  onDismiss,
  onComplete,
  hold = false, // If true, don't auto-close
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const balloonRef = useRef(null);
  const dismissButtonRef = useRef(null);
  const wordIndexRef = useRef(0);

  /**
   * Word-by-word text reveal
   * Extracted from clippyjs balloon.js _sayWords method
   */
  const speakWords = useCallback((fullText, onFinish) => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Show full text immediately
      setDisplayedText(fullText);
      setIsSpeaking(false);
      onFinish?.();
      return;
    }

    const words = fullText.split(/\s+/);
    wordIndexRef.current = 0;
    setIsSpeaking(true);
    setDisplayedText('');

    const addWord = () => {
      if (wordIndexRef.current >= words.length) {
        // Speaking complete
        setIsSpeaking(false);
        onFinish?.();
        return;
      }

      // Build text up to current word
      setDisplayedText(words.slice(0, wordIndexRef.current + 1).join(' '));
      wordIndexRef.current++;

      // Schedule next word
      speakTimerRef.current = setTimeout(addWord, WORD_SPEAK_TIME);
    };

    addWord();
  }, []);

  /**
   * Auto-close after speaking completes
   */
  const scheduleClose = useCallback(() => {
    if (hold) return;

    closeTimerRef.current = setTimeout(() => {
      onComplete?.();
    }, CLOSE_BALLOON_DELAY);
  }, [hold, onComplete]);

  // Start speaking when text changes and is visible
  useEffect(() => {
    if (!isVisible || !text) {
      setDisplayedText('');
      return;
    }

    // Clear any existing timers
    if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

    // Start speaking
    speakWords(text, scheduleClose);

    // Focus dismiss button for accessibility
    setTimeout(() => {
      dismissButtonRef.current?.focus();
    }, 100);

    return () => {
      if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [text, isVisible, speakWords, scheduleClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Handle keyboard dismiss
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onDismiss?.();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={balloonRef}
      className={`${styles.balloon} ${styles[position]}`}
      role="dialog"
      aria-labelledby="imp-balloon-title"
      aria-describedby="imp-balloon-text"
      onKeyDown={handleKeyDown}
    >
      {/* Tip pointer */}
      <div className={styles.tip} aria-hidden="true" />

      {/* Header */}
      <div className={styles.header}>
        <span id="imp-balloon-title" className={styles.title}>
          Imp says...
        </span>
        <button
          ref={dismissButtonRef}
          type="button"
          className={styles.dismissButton}
          onClick={onDismiss}
          aria-label="Dismiss tip"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div id="imp-balloon-text" className={styles.content}>
        {displayedText}
        {isSpeaking && <span className={styles.cursor} aria-hidden="true" />}
      </div>
    </div>
  );
}

ImpBalloon.propTypes = {
  text: PropTypes.string,
  isVisible: PropTypes.bool,
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  onDismiss: PropTypes.func,
  onComplete: PropTypes.func,
  hold: PropTypes.bool,
};
