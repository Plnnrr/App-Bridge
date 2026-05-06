export function getAppId(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const appId = params.get('appId');
  if (appId) {
    sessionStorage.setItem('plnnrr_appId', appId);
    return appId;
  }
  return sessionStorage.getItem('plnnrr_appId');
}
