// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { TikTokLoginReviewDetector, isTikTokAuthRoute } from './tiktokLoginReviewDetector'

describe('TikTokLoginReviewDetector', () => {
  it('recognizes authentication routes', () => {
    expect(isTikTokAuthRoute('https://www.tiktok.com/login/phone-or-email/email')).toBe(true)
    expect(isTikTokAuthRoute('https://www.tiktok.com/passport/web/account/info/')).toBe(true)
    expect(isTikTokAuthRoute('https://www.tiktok.com/foryou')).toBe(false)
  })

  it('does not trigger for a restored authenticated session', () => {
    const detector = new TikTokLoginReviewDetector()
    expect(detector.observeNavigation('https://www.tiktok.com/foryou', true)).toBe(false)
  })

  it('triggers once after interactive login and a valid session cookie', () => {
    const detector = new TikTokLoginReviewDetector()
    expect(detector.observeNavigation('https://www.tiktok.com/login', false)).toBe(false)
    expect(detector.observeNavigation('https://www.tiktok.com/foryou', true)).toBe(true)
    expect(detector.observeNavigation('https://www.tiktok.com/messages', true)).toBe(false)
  })

  it('detects modal login from the session-cookie transition', () => {
    const detector = new TikTokLoginReviewDetector()
    detector.initializeSessionState(false)
    expect(detector.observeSessionState(false)).toBe(false)
    expect(detector.observeSessionState(true)).toBe(true)
    expect(detector.observeSessionState(true)).toBe(false)
  })

  it('does not treat a restored cookie as a new login', () => {
    const detector = new TikTokLoginReviewDetector()
    detector.initializeSessionState(true)
    expect(detector.observeSessionState(true)).toBe(false)
  })
})
