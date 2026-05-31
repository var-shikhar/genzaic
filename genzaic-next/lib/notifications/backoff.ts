export const MAX_ATTEMPTS = 5

const SCHEDULE_MS = [
  60_000,            // 1 minute
  5 * 60_000,        // 5 minutes
  15 * 60_000,       // 15 minutes
  60 * 60_000,       // 1 hour
  6 * 60 * 60_000,   // 6 hours
]

export function nextAttemptDelayMs(attempts: number): number {
  const idx = Math.max(0, Math.min(attempts - 1, SCHEDULE_MS.length - 1))
  return SCHEDULE_MS[idx]
}
