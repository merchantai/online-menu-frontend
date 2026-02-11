/**
 * Detects the store ID from the current environment (Subdomain or Query Param)
 */
export const getStoreId = () => {
  const hostname = window.location.hostname;
  const params = new URLSearchParams(window.location.search);
  
  // 1. Priority: Query parameter
  const queryId = params.get('hotel') || params.get('shop');
  if (queryId) return queryId;

  // 2. Subdomain detection
  const parts = hostname.split('.');
  
  // Localhost detection
  const isLocal = hostname.includes('localhost') || hostname === '127.0.0.1';

  if (isLocal) {
    if (parts.length >= 2 && parts[parts.length-1] === 'localhost') {
      return parts[0];
    }
    return null;
  }

  // Handle Firebase domains (site.web.app or site.firebaseapp.com)
  const isFirebase = hostname.endsWith('web.app') || hostname.endsWith('firebaseapp.com');
  
  if (isFirebase) {
    // site.web.app -> 3 parts
    // store.site.web.app -> 4 parts
    if (parts.length >= 4) {
      return parts[0];
    }
    return null;
  }

  // Production: store1.online-menu.com (3 parts)
  // online-menu.com (2 parts)
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
};

/**
 * Gets the base domain (e.g., localhost:5173 or online-menu.com)
 */
export const getBaseDomain = () => {
  const hostname = window.location.hostname;
  const host = window.location.host; // includes port
  const parts = hostname.split('.');
  
  if (hostname.includes('localhost')) {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `localhost${port}`;
  }

  const isFirebase = hostname.endsWith('web.app') || hostname.endsWith('firebaseapp.com');
  if (isFirebase) {
    // store.site.web.app -> site.web.app (keep last 3 parts)
    const base = parts.slice(-3).join('.');
    const port = window.location.port ? `:${window.location.port}` : '';
    return base + port;
  }
  
  if (parts.length >= 3) {
    // shop1.online-menu.com -> online-menu.com
    const base = parts.slice(-2).join('.');
    const port = window.location.port ? `:${window.location.port}` : '';
    return base + port;
  }
  
  return host;
};

/**
 * Generates an absolute URL for the discovery platform
 */
export const getDiscoveryUrl = () => {
  const protocol = window.location.protocol;
  const base = getBaseDomain();
  return `${protocol}//${base}/`;
};

/**
 * Generates an absolute URL for a specific store
 */
export const getStoreUrl = (storeId) => {
  const protocol = window.location.protocol;
  const base = getBaseDomain();
  
  // In development, we often use query params for convenience if not using subdomains
  // But if the user is ALREADY using subdomains on localhost, we should stick to it
  if (window.location.hostname.includes('localhost') && !window.location.hostname.includes('.')) {
      return `${protocol}//${base}/?shop=${storeId}`;
  }
  
  return `${protocol}//${storeId}.${base}/`;
};
