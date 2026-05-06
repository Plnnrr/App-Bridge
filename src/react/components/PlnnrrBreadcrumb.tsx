'use client';

import { useEffect } from 'react';
import { BreadcrumbItem } from '../types';
import { getAppId } from '../utils/getAppId';

export function PlnnrrBreadcrumb({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) {
  const stringifiedBreadcrumbs = JSON.stringify(breadcrumbs);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const appId = getAppId();

    if (window.parent !== window && appId) {
      window.parent.postMessage(
        {
          type: 'PLNNRR_BREADCRUMB',
          appId,
          breadcrumbs: JSON.parse(stringifiedBreadcrumbs),
        },
        '*'
      );
    }
  }, [stringifiedBreadcrumbs]);

  return null;
}
