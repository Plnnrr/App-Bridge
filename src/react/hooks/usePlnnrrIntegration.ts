'use client';

import { useContext } from 'react';
import { PlnnrrIntegrationContext } from '../context/PlnnrrIntegrationContext';

export function usePlnnrrIntegration() {
  const context = useContext(PlnnrrIntegrationContext);
  console.log('context', context);
  if (!context) {
    throw new Error('usePlnnrrIntegration must be used within a PlnnrrIntegrationProvider');
  }
  return context;
}
