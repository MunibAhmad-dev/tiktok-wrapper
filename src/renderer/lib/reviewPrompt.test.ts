// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  REVIEW_DISMISS_KEY,
  REVIEW_LAUNCH_KEY,
  REVIEW_STATE_VERSION_KEY,
  REVIEW_VERSION_KEY,
  isThirdReviewLaunch,
  migrateReviewPromptState,
  recordReviewLaunch,
  shouldShowReview,
} from './reviewPrompt'

const values = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, String(value)),
  },
})

describe('reviewPrompt', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('triggers only on the third launch', () => {
    expect(isThirdReviewLaunch(recordReviewLaunch())).toBe(false)
    expect(isThirdReviewLaunch(recordReviewLaunch())).toBe(false)
    expect(isThirdReviewLaunch(recordReviewLaunch())).toBe(true)
    expect(localStorage.getItem(REVIEW_LAUNCH_KEY)).toBe('3')
  })

  it('snoozes the same app version for seven days', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
    localStorage.setItem(REVIEW_VERSION_KEY, '1.0.0')
    localStorage.setItem(REVIEW_DISMISS_KEY, '999999')
    expect(shouldShowReview('1.0.0')).toBe(false)
    expect(shouldShowReview('1.1.0')).toBe(true)
  })

  it('migrates away stale custom-dialog state once', () => {
    localStorage.setItem(REVIEW_VERSION_KEY, '1.0.0')
    localStorage.setItem(REVIEW_DISMISS_KEY, '123')
    migrateReviewPromptState()
    expect(localStorage.getItem(REVIEW_VERSION_KEY)).toBeNull()
    expect(localStorage.getItem(REVIEW_DISMISS_KEY)).toBeNull()
    expect(localStorage.getItem(REVIEW_STATE_VERSION_KEY)).toBe('direct-review-v1')
  })
})
