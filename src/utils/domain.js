/**
 * Detects the store ID from the current environment (Path or Query Param)
 * Priority: Query Param > Path Segment
 */
export const getStoreId = () => {
  const params = new URLSearchParams(window.location.search);
  
  // 1. Priority: Query parameter (for backward compatibility/manual overrides)
  const queryId = params.get('hotel') || params.get('shop');
  if (queryId) return queryId;

  // 2. Path detection: /shopid or /shopid/about
  const pathname = window.location.pathname;
  const parts = pathname.split('/').filter(p => p !== '');
  
  if (parts.length > 0) {
    const firstSegment = parts[0];
    
    // Exclude platform segments
    const platformSegments = ['join', 'terms', 'privacy', 'about', 'manage', 'auth'];
    if (platformSegments.includes(firstSegment)) {
      return null;
    }
    
    return firstSegment;
  }

  return null;
};

/**
 * Gets the base domain (e.g., localhost:5173 or promenu.valueappsolutions.com)
 */
export const getBaseDomain = () => {
  const hostname = window.location.hostname;
  const host = window.location.host;

  // Localhost/dev detection
  if (hostname.includes('localhost') || hostname === '127.0.0.1') {
    return host;
  }

  // Use the custom domain as the source of truth for production
  return 'promenu.valueappsolutions.com';
};

/**
 * Generates an absolute URL for the discovery platform
 */
export const getDiscoveryUrl = () => {
  const protocol = window.location.protocol;
  const host = getBaseDomain();
  return `${protocol}//${host}/`;
};

/**
 * Generates an absolute URL for a specific store
 */
export const getStoreUrl = (storeId) => {
  const protocol = window.location.protocol;
  const host = getBaseDomain();
  return `${protocol}//${host}/${storeId}`;
};
