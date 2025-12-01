import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const ImpContext = createContext(null);

// localStorage keys
const SEEN_TIPS_KEY = 'capi-imp-seen-tips';
const DISMISSED_KEY = 'capi-imp-dismissed';

/**
 * ImpProvider - Manages state for the Imp assistant
 *
 * State:
 * - isVisible: whether the balloon is currently showing
 * - isMinimized: whether Imp has been dismissed (shows small icon)
 * - currentTip: the tip object currently being displayed
 * - seenTipIds: array of tip IDs that have been shown
 * - currentAnimation: animation currently playing
 */
export function ImpProvider({ children }) {
  // Visibility state
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Current tip and animation
  const [currentTip, setCurrentTip] = useState(null);
  const [currentAnimation, setCurrentAnimation] = useState('Idle');

  // Seen tips tracking (persisted)
  const [seenTipIds, setSeenTipIds] = useState(() => {
    try {
      const stored = localStorage.getItem(SEEN_TIPS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist seen tips to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SEEN_TIPS_KEY, JSON.stringify(seenTipIds));
    } catch (e) {
      console.warn('Failed to save seen tips:', e);
    }
  }, [seenTipIds]);

  // Persist dismissed state
  useEffect(() => {
    try {
      localStorage.setItem(DISMISSED_KEY, isMinimized.toString());
    } catch (e) {
      console.warn('Failed to save dismissed state:', e);
    }
  }, [isMinimized]);

  /**
   * Show a tip with optional animation
   */
  const showTip = useCallback((tip) => {
    if (!tip) return;

    setCurrentTip(tip);
    setIsVisible(true);
    setIsMinimized(false);

    // Set animation based on tip
    if (tip.animation) {
      setCurrentAnimation(tip.animation);
    }

    // Mark tip as seen
    if (tip.id && !seenTipIds.includes(tip.id)) {
      setSeenTipIds(prev => [...prev, tip.id]);
    }
  }, [seenTipIds]);

  /**
   * Dismiss the current tip (minimizes Imp)
   */
  const dismissTip = useCallback(() => {
    setIsVisible(false);
    setIsMinimized(true);
    setCurrentAnimation('Idle');
  }, []);

  /**
   * Close balloon without minimizing (for auto-close)
   */
  const closeBalloon = useCallback(() => {
    setIsVisible(false);
    setCurrentAnimation('Idle');
  }, []);

  /**
   * Show Imp without a tip (just the character)
   */
  const showImp = useCallback(() => {
    setIsMinimized(false);
  }, []);

  /**
   * Hide Imp completely
   */
  const hideImp = useCallback(() => {
    setIsVisible(false);
    setIsMinimized(true);
  }, []);

  /**
   * Play an animation
   */
  const playAnimation = useCallback((animationName) => {
    setCurrentAnimation(animationName);
  }, []);

  /**
   * Reset to idle animation
   */
  const resetAnimation = useCallback(() => {
    setCurrentAnimation('Idle');
  }, []);

  /**
   * Clear all seen tips (for testing)
   */
  const clearSeenTips = useCallback(() => {
    setSeenTipIds([]);
  }, []);

  /**
   * Check if a tip has been seen
   */
  const hasTipBeenSeen = useCallback((tipId) => {
    return seenTipIds.includes(tipId);
  }, [seenTipIds]);

  const value = {
    // State
    isVisible,
    isMinimized,
    currentTip,
    currentAnimation,
    seenTipIds,

    // Actions
    showTip,
    dismissTip,
    closeBalloon,
    showImp,
    hideImp,
    playAnimation,
    resetAnimation,
    clearSeenTips,
    hasTipBeenSeen,
  };

  return (
    <ImpContext.Provider value={value}>
      {children}
    </ImpContext.Provider>
  );
}

ImpProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to access Imp context
 */
export function useImp() {
  const context = useContext(ImpContext);
  if (!context) {
    throw new Error('useImp must be used within an ImpProvider');
  }
  return context;
}
