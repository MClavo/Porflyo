// Scroll metrics tracker
// Tracks scroll distance, velocity, and patterns

export type ScrollMetrics = {
  totalScrollDistance: number;
  averageScrollVelocity: number;
  scrollSessions: number;
  maxScrollVelocity: number;
  scrollDirection: 'up' | 'down' | 'mixed';
  timeSpentScrolling: number;
};

export type ScrollEvent = {
  timestamp: number;
  scrollY: number;
  velocity: number;
  direction: 'up' | 'down';
};

class ScrollTracker {
  private isTracking = false;
  private lastScrollY = 0;
  private lastScrollTime = 0;
  private totalDistance = 0;
  private velocities: number[] = [];
  private scrollSessions = 0;
  private currentSessionStart: number | null = null;
  private totalScrollTime = 0;
  private scrollDirections: ('up' | 'down')[] = [];
  private scrollEventListener: (() => void) | null = null;
  private sessionTimeoutId: number | null = null;
  private readonly SESSION_TIMEOUT = 1000; // 1 segundo de no scroll = end session
  private targetElement: HTMLElement | Window | null = null;

  // Get scroll position from current target element
  private getScrollPosition(): number {
    if (!this.targetElement) return 0;
    
    if (this.targetElement === window) {
      return window.scrollY;
    } else {
      return (this.targetElement as HTMLElement).scrollTop;
    }
  }

  // Start tracking scroll events
  startTracking(element?: HTMLElement | null) {
    if (this.isTracking) {
      // If already tracking, stop first
      this.stopTracking();
    }
    
    // Use provided element or fallback to window
    this.targetElement = element || window;
    
    // Validate that the element is actually scrollable
    if (element && element.scrollHeight <= element.clientHeight) {
      console.warn('⚠️ Provided element is not scrollable, falling back to window');
      this.targetElement = window;
    }
    
    this.isTracking = true;
    this.lastScrollY = this.getScrollPosition();
    this.lastScrollTime = Date.now();

    this.scrollEventListener = this.handleScroll.bind(this);
    this.targetElement.addEventListener('scroll', this.scrollEventListener, { passive: true });
    
    console.log('✅ Scroll tracking started on:', this.targetElement === window ? 'window' : this.targetElement);
  }

  // Stop tracking scroll events
  stopTracking() {
    if (!this.isTracking) return;
    
    this.isTracking = false;
    
    if (this.scrollEventListener && this.targetElement) {
      this.targetElement.removeEventListener('scroll', this.scrollEventListener);
      this.scrollEventListener = null;
    }

    this.endCurrentSession();
    this.targetElement = null;
  }

  private handleScroll() {
    const currentScrollY = this.getScrollPosition();
    const currentTime = Date.now();
    
    // Calculate distance and velocity
    const distance = Math.abs(currentScrollY - this.lastScrollY);
    const timeDiff = currentTime - this.lastScrollTime;
    
    // Ignore very small movements (noise) and ensure time difference is reasonable
    if (timeDiff > 0 && distance > 1) {
      const velocity = distance / timeDiff; // pixels per millisecond
      
      // Determine direction
      const direction: 'up' | 'down' = currentScrollY > this.lastScrollY ? 'down' : 'up';
      
      // Update metrics
      this.totalDistance += distance;
      this.velocities.push(velocity);
      this.scrollDirections.push(direction);
      
      // Session management
      this.startNewSessionIfNeeded();
      this.resetSessionTimeout();
      
      // Debug log for troubleshooting
      if (this.velocities.length % 10 === 0) {
        console.log(`📊 Scroll event #${this.velocities.length}: ${distance}px, ${(velocity * 1000).toFixed(1)}px/s`);
      }
    }
    
    this.lastScrollY = currentScrollY;
    this.lastScrollTime = currentTime;
  }

  private startNewSessionIfNeeded() {
    if (!this.currentSessionStart) {
      this.currentSessionStart = Date.now();
      this.scrollSessions++;
    }
  }

  private resetSessionTimeout() {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }
    
    this.sessionTimeoutId = setTimeout(() => {
      this.endCurrentSession();
    }, this.SESSION_TIMEOUT);
  }

  private endCurrentSession() {
    if (this.currentSessionStart) {
      this.totalScrollTime += Date.now() - this.currentSessionStart;
      this.currentSessionStart = null;
    }
    
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
      this.sessionTimeoutId = null;
    }
  }

  // Get current scroll metrics
  getMetrics(): ScrollMetrics {
    // Calculate average velocity
    const averageVelocity = this.velocities.length > 0 
      ? this.velocities.reduce((sum, v) => sum + v, 0) / this.velocities.length 
      : 0;

    // Calculate max velocity
    const maxVelocity = this.velocities.length > 0 
      ? Math.max(...this.velocities) 
      : 0;

    // Determine predominant scroll direction
    const upCount = this.scrollDirections.filter(d => d === 'up').length;
    const downCount = this.scrollDirections.filter(d => d === 'down').length;
    
    let direction: 'up' | 'down' | 'mixed' = 'mixed';
    if (upCount === 0 && downCount > 0) direction = 'down';
    else if (downCount === 0 && upCount > 0) direction = 'up';
    else if (Math.abs(upCount - downCount) / (upCount + downCount) > 0.7) {
      direction = upCount > downCount ? 'up' : 'down';
    }

    // Include current session time if active
    let totalTimeScrolling = this.totalScrollTime;
    if (this.currentSessionStart) {
      totalTimeScrolling += Date.now() - this.currentSessionStart;
    }

    return {
      totalScrollDistance: Math.round(this.totalDistance),
      averageScrollVelocity: Math.round(averageVelocity * 1000 * 100) / 100, // pixels per second, rounded
      scrollSessions: this.scrollSessions,
      maxScrollVelocity: Math.round(maxVelocity * 1000 * 100) / 100, // pixels per second, rounded
      scrollDirection: direction,
      timeSpentScrolling: totalTimeScrolling
    };
  }

  // Clear all scroll metrics
  clear() {
    this.totalDistance = 0;
    this.velocities = [];
    this.scrollSessions = 0;
    this.currentSessionStart = null;
    this.totalScrollTime = 0;
    this.scrollDirections = [];
    this.endCurrentSession();
  }

  // Get a scroll engagement score (0-100)
  getEngagementScore(): number {
    const metrics = this.getMetrics();
    
    // Normalize factors for scoring
    const distanceScore = Math.min(metrics.totalScrollDistance / 5000, 1) * 30; // Max 30 points for distance
    const velocityScore = Math.min(metrics.averageScrollVelocity / 100, 1) * 20; // Max 20 points for velocity
    const sessionScore = Math.min(metrics.scrollSessions / 10, 1) * 25; // Max 25 points for sessions
    const timeScore = Math.min(metrics.timeSpentScrolling / 60000, 1) * 25; // Max 25 points for time (1 minute max)
    
    return Math.round(distanceScore + velocityScore + sessionScore + timeScore);
  }

  // Debug method to check if tracking is working
  getTrackingStatus() {
    let elementInfo = 'null';
    if (this.targetElement === window) {
      elementInfo = 'window';
    } else if (this.targetElement) {
      elementInfo = (this.targetElement as HTMLElement).tagName || 'unknown';
    }

    return {
      isTracking: this.isTracking,
      targetElement: elementInfo,
      hasListener: !!this.scrollEventListener,
      currentPosition: this.getScrollPosition(),
      lastPosition: this.lastScrollY,
      totalEvents: this.velocities.length
    };
  }
}

export const scrollTracker = new ScrollTracker();
export default scrollTracker;