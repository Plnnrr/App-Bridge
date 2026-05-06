'use client';

import React, { useEffect } from 'react';
import { getAppId } from '../utils/getAppId';
import { PlnnrrIntegrationProvider } from './PlnnrrIntegrationProvider';

export function PlnnrrAppProvider({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const appId = getAppId();
    if (window.parent === window || !appId) return;

    const syncRoute = () => {
      const route = window.location.pathname + window.location.search;
      const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
      window.parent.postMessage(
        {
          type: 'PLNNRR_ROUTE_CHANGE',
          appId,
          route: normalizedRoute,
        },
        '*'
      );
    };

    // Initial sync
    syncRoute();

    // Patch history API to intercept client-side navigations (e.g., Next.js router)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      syncRoute();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      syncRoute();
    };

    window.addEventListener('popstate', syncRoute);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  return <PlnnrrIntegrationProvider>{children}</PlnnrrIntegrationProvider>;
}
