"use client"

import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query"
import { toast } from "sonner"

interface ToastOpts {
  loading?: string
  success?: string
  error?: string
}

interface OptimisticOpts<TInput, TQueryData> {
  queryKey: QueryKey
  updater: (old: TQueryData | undefined, input: TInput) => TQueryData | undefined
}

interface Options<TInput, TData, TQueryData> {
  mutationFn: (input: TInput) => Promise<TData>
  optimistic?: OptimisticOpts<TInput, TQueryData>
  invalidateKeys?: QueryKey[]
  toast?: ToastOpts
  onSuccess?: (data: TData, input: TInput) => void
  onError?: (err: unknown, input: TInput) => void
}

export function useOptimisticMutation<TInput, TData, TQueryData = unknown>(
  opts: Options<TInput, TData, TQueryData>,
) {
  const qc = useQueryClient()

  const mutationOptions: UseMutationOptions<TData, unknown, TInput, { snapshot?: TQueryData }> = {
    mutationFn: opts.mutationFn,
    onMutate: async (input) => {
      if (!opts.optimistic) return {}
      const { queryKey, updater } = opts.optimistic
      await qc.cancelQueries({ queryKey })
      const snapshot = qc.getQueryData<TQueryData>(queryKey)
      qc.setQueryData<TQueryData>(queryKey, (old) => updater(old, input) as TQueryData)
      return { snapshot }
    },
    onError: (err, input, ctx) => {
      if (opts.optimistic && ctx?.snapshot !== undefined) {
        qc.setQueryData(opts.optimistic.queryKey, ctx.snapshot)
      }
      if (opts.toast?.error) toast.error(opts.toast.error)
      opts.onError?.(err, input)
    },
    onSuccess: (data, input) => {
      if (opts.toast?.success) toast.success(opts.toast.success)
      opts.onSuccess?.(data, input)
    },
    onSettled: () => {
      const keys = opts.invalidateKeys ?? (opts.optimistic ? [opts.optimistic.queryKey] : [])
      keys.forEach((key) => qc.invalidateQueries({ queryKey: key }))
    },
  }

  return useMutation(mutationOptions)
}
