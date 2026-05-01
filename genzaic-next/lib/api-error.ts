// API routes return `{ error: string }` on failure. RTK Query wrapped this as
// `err.data.error`; the new TanStack Query layer throws native `Error` objects
// where the backend message is the `Error.message`. This helper handles both
// shapes so error toasts surface backend-specific messages regardless of which
// call path produced the failure.
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback

  if (err instanceof Error && err.message) return err.message

  const rtk = err as { data?: { error?: string; message?: string } }
  if (rtk?.data?.error) return rtk.data.error
  if (rtk?.data?.message) return rtk.data.message

  const plain = err as { error?: string; message?: string }
  if (plain?.error) return plain.error
  if (plain?.message) return plain.message

  return fallback
}
