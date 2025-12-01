/**
 * useImpTip - Hook for selecting context-aware tips
 *
 * Determines the current context based on:
 * - Current route/page
 * - Route params (clientId, platform)
 * - Wizard phase (if on wizard page)
 *
 * Then selects an appropriate tip from impTips.js
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useImp } from '../contexts/ImpContext';
import { getTipsForContext, selectTip, impTips } from '../data/impTips';
import { getPlatformById } from '../data/platforms';

/**
 * Determine the current page type from pathname
 */
function getPageType(pathname) {
  if (pathname === '/') return 'dashboard';
  if (pathname === '/clients/new') return 'newClient';
  if (pathname.startsWith('/wizard/')) return 'wizard';
  if (pathname.match(/^\/clients\/[^/]+$/)) return 'clientDetail';
  if (pathname.startsWith('/docs')) return 'docs';
  return 'any';
}

/**
 * Extract wizard phase from URL if on wizard page
 * Note: This is a simple implementation - could be enhanced
 * to read actual step data from context/props
 */
function getWizardPhase(pathname, _params) {
  if (!pathname.startsWith('/wizard/')) return null;

  // Default to phase 1 if we can't determine
  // In a full implementation, we'd get this from wizard state
  return 1;
}

export function useImpTip(contextData = {}) {
  const location = useLocation();
  const params = useParams();
  const { seenTipIds } = useImp();

  // Determine current page type
  const pageType = useMemo(() => {
    return getPageType(location.pathname);
  }, [location.pathname]);

  // Get platform info if available
  const platformInfo = useMemo(() => {
    if (params.platform) {
      return getPlatformById(params.platform);
    }
    return null;
  }, [params.platform]);

  // Get wizard phase if on wizard page
  const phase = useMemo(() => {
    return getWizardPhase(location.pathname, params);
  }, [location.pathname, params]);

  /**
   * Build context object for tip filtering
   */
  const context = useMemo(() => ({
    page: pageType,
    platform: params.platform || null,
    platformCategory: platformInfo?.category || null,
    phase: phase,
    clientId: params.clientId || null,
    // Additional context from caller
    ...contextData,
  }), [pageType, params.platform, params.clientId, platformInfo?.category, phase, contextData]);

  /**
   * Get the next tip based on current context
   */
  const getNextTip = useCallback(() => {
    // Get tips matching current context
    const matchingTips = getTipsForContext(context);

    // Select one tip, prioritizing unseen tips
    return selectTip(matchingTips, seenTipIds);
  }, [context, seenTipIds]);

  /**
   * Get a specific tip by ID (for testing/debugging)
   */
  const getTipById = useCallback((tipId) => {
    return impTips.find(t => t.id === tipId) || null;
  }, []);

  return {
    getNextTip,
    getTipById,
    context,
    pageType,
    platformInfo,
    phase,
  };
}

export default useImpTip;
