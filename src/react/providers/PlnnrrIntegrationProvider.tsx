'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PlnnrrIntegrationContext } from '../context/PlnnrrIntegrationContext';
import { PlnnrrIntegrationConfig } from '../types';

export function PlnnrrIntegrationProvider({ children }: { children?: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('en');
  const [appId, setAppId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In production, you'd verify event.origin matches Plnnrr
      const data = event.data;
      if (data && data.type === 'PLNNRR_INIT') {
        console.log('handleMessage', data);
        if (data.token) setToken(data.token);
        if (data.lang) setLanguage(data.lang);
        if (data.appId) setAppId(data.appId);
        setIsReady(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendConfig = useCallback((config: PlnnrrIntegrationConfig) => {
    // Send message back to parent window
    if (window.parent !== window && appId) {
      window.parent.postMessage(
        {
          type: 'PLNNRR_CONFIG',
          appId,
          tabs: config.tabs,
        },
        '*' // In production, specify Plnnrr origin
      );
    }
  }, [appId]);

  return (
    <PlnnrrIntegrationContext.Provider value={{ token, language, isReady, sendConfig }}>
      {children}
    </PlnnrrIntegrationContext.Provider>
  );
}
