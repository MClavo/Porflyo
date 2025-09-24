/**
 * Utility to detect if this is a page refresh vs navigation
 * 
 * This function uses multiple strategies to detect a page refresh:
 * 1. performance.navigation.type (modern browsers)
 * 2. sessionStorage flag (fallback)
 * 
 * Uses a global session flag and ensures refresh is only detected once per session.
 * However, during the initial mount cycle, multiple hooks can detect the same refresh.
 */

let hasCheckedRefresh = false;
let wasPageRefresh = false;
let initialCheckComplete = false;

export function isPageRefresh(): boolean {
  // During the initial mount cycle, allow all hooks to detect refresh
  if (!initialCheckComplete) {
    // Check if performance.navigation is available (modern browsers)
    if (typeof performance !== 'undefined' && performance.navigation) {
      const isRefresh = performance.navigation.type === performance.navigation.TYPE_RELOAD;
      
      if (!hasCheckedRefresh) {
        wasPageRefresh = isRefresh;
        hasCheckedRefresh = true;
        
        // Mark initial check as complete after a short delay to allow all hooks to mount
        setTimeout(() => {
          initialCheckComplete = true;
        }, 100);
      }
      
      return wasPageRefresh;
    }
    
    // Fallback: use sessionStorage flag globally
    const sessionKey = 'app_session_started';
    const isRefresh = !sessionStorage.getItem(sessionKey);
    
    if (!hasCheckedRefresh) {
      wasPageRefresh = isRefresh;
      hasCheckedRefresh = true;
      
      if (isRefresh) {
        sessionStorage.setItem(sessionKey, 'true');
      }
      
      // Mark initial check as complete after a short delay
      setTimeout(() => {
        initialCheckComplete = true;
      }, 100);
    }
    
    return wasPageRefresh;
  }
  
  // After initial check, return the cached result
  return wasPageRefresh;
}

/**
 * Clears the session flag (useful for testing or manual reset)
 */
export function clearSessionFlag(): void {
  sessionStorage.removeItem('app_session_started');
  hasCheckedRefresh = false;
  wasPageRefresh = false;
  initialCheckComplete = false;
}

/**
 * Forces a reset of the refresh detection (useful for testing)
 */
export function resetRefreshDetection(): void {
  hasCheckedRefresh = false;
  wasPageRefresh = false;
  initialCheckComplete = false;
}