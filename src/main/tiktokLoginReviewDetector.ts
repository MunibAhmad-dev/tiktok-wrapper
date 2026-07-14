const TIKTOK_HOSTS = new Set(['tiktok.com', 'www.tiktok.com', 'm.tiktok.com'])

const AUTH_PATH_PREFIXES = [
  '/login',
  '/signup',
  '/passport',
  '/auth/authorize',
]

function parseTikTokUrl(rawUrl: string): URL | null {
  try {
    const url = new URL(rawUrl)
    return TIKTOK_HOSTS.has(url.hostname) ? url : null
  } catch {
    return null
  }
}

export function isTikTokAuthRoute(rawUrl: string): boolean {
  const url = parseTikTokUrl(rawUrl)
  return Boolean(url && AUTH_PATH_PREFIXES.some(prefix => url.pathname.startsWith(prefix)))
}

/** Detect one successful interactive login, excluding restored sessions. */
export class TikTokLoginReviewDetector {
  private observedAuthRoute = false
  private emitted = false
  private sessionStateInitialized = false
  private hadSessionCookie = false

  initializeSessionState(hasSessionCookie: boolean): void {
    if (this.sessionStateInitialized) return
    this.hadSessionCookie = hasSessionCookie
    this.sessionStateInitialized = true
  }

  /**
   * TikTok often completes authentication inside a modal without navigating
   * the main frame. A no-cookie -> valid-cookie transition is therefore the
   * most reliable successful-login signal and still excludes restored sessions.
   */
  observeSessionState(hasSessionCookie: boolean): boolean {
    if (this.emitted) return false
    if (!this.sessionStateInitialized) {
      this.initializeSessionState(hasSessionCookie)
      return false
    }

    const completedLogin = !this.hadSessionCookie && hasSessionCookie
    this.hadSessionCookie = hasSessionCookie
    if (!completedLogin) return false

    this.emitted = true
    return true
  }

  observeNavigation(rawUrl: string, hasSessionCookie: boolean): boolean {
    const url = parseTikTokUrl(rawUrl)
    if (!url || this.emitted) return false

    if (isTikTokAuthRoute(rawUrl)) {
      this.observedAuthRoute = true
      return false
    }

    if (!this.observedAuthRoute || !hasSessionCookie) return false
    this.emitted = true
    this.hadSessionCookie = true
    return true
  }
}
