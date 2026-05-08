'use client';

import React, { useEffect } from 'react';
import { getAppId } from '../utils/getAppId';
import { PlnnrrIntegrationProvider } from './PlnnrrIntegrationProvider';

export function PlnnrrAppProvider({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.parent === window) return;

    let currentAppId = getAppId();

    const setupSync = (appId: string) => {
      const syncRoute = () => {
        const url = new URL(window.location.href);
        const route = url.pathname + url.search;
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

      // Catch SSR navigations (regular anchor clicks that bypass client router)
      const handleAnchorClick = (e: MouseEvent) => {
        if (e.defaultPrevented) return;
        
        const target = e.target as HTMLElement;
        const anchor = target.closest('a');
        if (!anchor) return;
        
        const href = anchor.getAttribute('href');
        const targetAttr = anchor.getAttribute('target');
        
        if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || targetAttr === '_blank') {
          return;
        }
        
        let url: URL;
        try {
          url = new URL(href, window.location.origin);
        } catch (e) {
          return;
        }
        
        if (url.origin !== window.location.origin) {
          return;
        }

        const route = url.pathname + url.search;
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

      // Catch form submissions (SSR form post/get)
      const handleFormSubmit = (e: SubmitEvent) => {
        if (e.defaultPrevented) return;
        
        const target = e.target as HTMLFormElement;
        const action = target.getAttribute('action') || window.location.href;
        
        let url: URL;
        try {
          url = new URL(action, window.location.origin);
        } catch (e) {
          return;
        }
        
        if (url.origin === window.location.origin) {
          const route = url.pathname + url.search;
          const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
          window.parent.postMessage(
            {
              type: 'PLNNRR_ROUTE_CHANGE',
              appId,
              route: normalizedRoute,
            },
            '*'
          );
        }
      };

      document.addEventListener('click', handleAnchorClick, true);
      document.addEventListener('submit', handleFormSubmit, true);

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
        document.removeEventListener('click', handleAnchorClick, true);
        document.removeEventListener('submit', handleFormSubmit, true);
      };
    };

    let cleanupSync: (() => void) | undefined;

    if (currentAppId) {
      cleanupSync = setupSync(currentAppId);
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PLNNRR_INIT' && event.data.appId) {
        if (currentAppId !== event.data.appId) {
          currentAppId = event.data.appId;
          sessionStorage.setItem('plnnrr_appId', event.data.appId);
          if (cleanupSync) cleanupSync();
          cleanupSync = setupSync(event.data.appId);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);

    // Notify parent that the app has loaded (useful after SSR navigations where iframe completely reloads)
    window.parent.postMessage({
      type: 'PLNNRR_APP_LOADED'
    }, '*');

    return () => {
      window.removeEventListener('message', handleMessage);
      if (cleanupSync) cleanupSync();
    };
  }, []);

  return <PlnnrrIntegrationProvider>{children}</PlnnrrIntegrationProvider>;
}
