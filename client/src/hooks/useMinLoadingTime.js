import { useState, useEffect } from 'react';
import { useFunMode } from '../contexts/FunModeContext';

/**
 * Hook that ensures a minimum loading time before showing content.
 * In Fun Mode: Enforces minimum time so users can read quest-style messages.
 * In Normal Mode: Shows loading only while data is fetching (no artificial delay).
 *
 * @param {boolean} isLoading - The actual loading state from data fetching
 * @param {number} minTime - Minimum time in ms to show loading in Fun Mode (default: 3000)
 * @returns {boolean} - Whether to show loading state
 */
export function useMinLoadingTime(isLoading, minTime = 3000) {
  const { funMode } = useFunMode();
  const [showLoading, setShowLoading] = useState(true);
  const [startTime] = useState(() => Date.now());

  // In normal mode, no minimum delay - show loading only while actually loading
  const effectiveMinTime = funMode ? minTime : 0;

  useEffect(() => {
    // If still loading, keep showing loading
    if (isLoading) {
      setShowLoading(true);
      return;
    }

    // Data loaded - check if minimum time has passed
    const elapsed = Date.now() - startTime;
    const remaining = effectiveMinTime - elapsed;

    if (remaining <= 0) {
      // Minimum time already passed (or no minimum), hide loading
      setShowLoading(false);
    } else {
      // Wait for remaining time before hiding loading (Fun Mode only)
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [isLoading, effectiveMinTime, startTime]);

  return showLoading;
}
