'use client';

import { createContext } from 'react';
import { PlnnrrIntegrationContextType } from '../types';

export const PlnnrrIntegrationContext = createContext<PlnnrrIntegrationContextType | null>(null);
