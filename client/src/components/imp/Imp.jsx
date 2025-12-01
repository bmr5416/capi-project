/**
 * Imp - Main Clippy-like assistant component
 * Only renders when Fun Mode is active
 *
 * Features:
 * - Context-aware tips based on current page/route
 * - Animated Clippy sprite with multiple animations
 * - Speech balloon with word-by-word reveal
 * - Proactive tip display on route changes
 * - Minimizable and dismissible
 */

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useFunMode } from '../../contexts/FunModeContext';
import { useImp } from '../../contexts/ImpContext';
import { useImpTip } from '../../hooks/useImpTip';
import ImpSprite from './ImpSprite';
import ImpBalloon from './ImpBalloon';
import styles from './Imp.module.css';

// Delay before showing tip after route change
const TIP_DELAY = 2000;

export default function Imp() {
  const { funMode } = useFunMode();
  const {
    isVisible,
    isMinimized,
    currentTip,
    currentAnimation,
    showTip,
    dismissTip,
    closeBalloon,
    resetAnimation,
  } = useImp();

  const { getNextTip } = useImpTip();
  const location = useLocation();

  const tipTimerRef = useRef(null);
  const lastPathRef = useRef(null);

  /**
   * Show a new contextual tip
   */
  const showNewTip = useCallback(() => {
    const tip = getNextTip();
    if (tip) {
      showTip(tip);
    }
  }, [getNextTip, showTip]);

  /**
   * Handle sprite click
   */
  const handleSpriteClick = useCallback(() => {
    if (isMinimized || !isVisible) {
      // Show a new tip
      showNewTip();
    }
  }, [isMinimized, isVisible, showNewTip]);

  /**
   * Handle dismiss
   */
  const handleDismiss = useCallback(() => {
    dismissTip();
  }, [dismissTip]);

  /**
   * Handle balloon complete (auto-close after speaking)
   */
  const handleBalloonComplete = useCallback(() => {
    closeBalloon();
  }, [closeBalloon]);

  /**
   * Handle animation complete
   */
  const handleAnimationComplete = useCallback((animationName) => {
    // Return to idle after non-idle animations
    if (animationName !== 'Idle') {
      resetAnimation();
    }
  }, [resetAnimation]);

  /**
   * Show tip on route change (with delay)
   */
  useEffect(() => {
    if (!funMode) return;

    const currentPath = location.pathname;

    // Don't show tip if we just rendered on the same path
    if (currentPath === lastPathRef.current) return;
    lastPathRef.current = currentPath;

    // Clear any pending tip timer
    if (tipTimerRef.current) {
      clearTimeout(tipTimerRef.current);
    }

    // Don't auto-show if user has minimized
    if (isMinimized) return;

    // Schedule tip display
    tipTimerRef.current = setTimeout(() => {
      const tip = getNextTip();
      if (tip) {
        showTip(tip);
      }
    }, TIP_DELAY);

    return () => {
      if (tipTimerRef.current) {
        clearTimeout(tipTimerRef.current);
      }
    };
  }, [location.pathname, funMode, isMinimized, getNextTip, showTip]);

  /**
   * Handle keyboard events (Escape to dismiss)
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleDismiss]);

  // Don't render if fun mode is off
  if (!funMode) {
    return null;
  }

  return (
    <div
      className={styles.container}
      role="complementary"
      aria-label="Imp Assistant"
    >
      {/* Speech balloon */}
      <ImpBalloon
        text={currentTip?.message}
        isVisible={isVisible}
        position="top-left"
        onDismiss={handleDismiss}
        onComplete={handleBalloonComplete}
        hold={false}
      />

      {/* Clippy sprite */}
      <ImpSprite
        animation={currentAnimation}
        isMinimized={isMinimized}
        onClick={handleSpriteClick}
        onAnimationComplete={handleAnimationComplete}
      />
    </div>
  );
}
