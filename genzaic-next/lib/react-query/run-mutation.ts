import { toast } from "sonner"

interface ToastOptions {
  loading?: string
  success: string
  error?: string
}

export async function runMutation<T>(
  promise: Promise<T>,
  { loading, success, error = "Something went wrong" }: ToastOptions,
): Promise<T | undefined> {
  if (loading) {
    return toast.promise(promise, { loading, success, error }) as unknown as Promise<T | undefined>
  }
  try {
    const result = await promise
    toast.success(success)
    return result
  } catch {
    toast.error(error)
    return undefined
  }
}
