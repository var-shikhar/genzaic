import { toast } from "sonner"

interface ToastOptions {
  loading?: string
  success: string
  error?: string
}

interface UnwrapPromise<T> extends Promise<T> {
  unwrap(): Promise<T>
}

/**
 * Wraps an RTK Query mutation trigger so success / error toasts fire
 * automatically. Returns the unwrapped result on success or `undefined`
 * on failure (the toast is the error UI).
 *
 * Usage:
 *   const [deleteProduct] = useDeleteProductMutation()
 *   await runMutation(deleteProduct(id), { success: "Deleted", error: "Failed to delete" })
 *
 * If `loading` is provided, a loading toast is shown and replaced with
 * the success / error toast on settle.
 */
export async function runMutation<T>(
  trigger: UnwrapPromise<T> | Promise<T> & { unwrap?: () => Promise<T> },
  { loading, success, error = "Something went wrong" }: ToastOptions
): Promise<T | undefined> {
  const promise =
    "unwrap" in trigger && typeof trigger.unwrap === "function"
      ? trigger.unwrap()
      : (trigger as Promise<T>)

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
