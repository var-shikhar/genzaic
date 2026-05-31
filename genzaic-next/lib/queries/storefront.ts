"use client"

import { useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  Product,
  Storefront as DbStorefront,
  StorefrontDraft,
} from "@/lib/db/schema"
import type { DraftContent } from "@/lib/validations/storefront"
import {
  deleteJSON,
  getJSON,
  patchJSON,
  patchJSONBody,
  postJSON,
  putForm,
} from "@/lib/react-query/fetcher"

export type Storefront = DbStorefront

export type PublicStorefront = Storefront & {
  products: Product[]
  seller?: {
    id: string
    name: string
    avatarUrl?: string | null
    followersCount: number
    totalSales: number
  }
}

export const storefrontKeys = {
  all: ["storefront"] as const,
  current: () => [...storefrontKeys.all, "current"] as const,
  public: (slug: string) => [...storefrontKeys.all, "public", slug] as const,
  slugCheck: (slug: string) => [...storefrontKeys.all, "slug-check", slug] as const,
  stats: () => [...storefrontKeys.all, "stats"] as const,
} as const

export interface StorefrontStats {
  totalViews: number
  totalRevenue: string
  totalOrders: number
}

export function useStorefront() {
  return useQuery({
    queryKey: storefrontKeys.current(),
    queryFn: () => getJSON<Storefront>("/api/storefront"),
  })
}

export function usePublicStorefront(slug: string) {
  return useQuery({
    queryKey: storefrontKeys.public(slug),
    queryFn: () => getJSON<PublicStorefront>(`/api/storefront/public/${slug}`),
    enabled: Boolean(slug),
    gcTime: 3_600_000,
  })
}

export function useUpdateStorefront() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: FormData) => putForm<Storefront>("/api/storefront", form),
    onSuccess: (data) => {
      qc.setQueryData(storefrontKeys.current(), data)
      qc.invalidateQueries({ queryKey: storefrontKeys.current() })
    },
  })
}

export function useTogglePublish() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => patchJSON<{ isPublished: boolean }>("/api/storefront/toggle-publish"),
    onSuccess: (data) => {
      qc.setQueryData<Storefront | undefined>(storefrontKeys.current(), (old) =>
        old ? { ...old, isPublished: data.isPublished } : old,
      )
      qc.invalidateQueries({ queryKey: storefrontKeys.current() })
    },
  })
}

/** Lifetime stats for the seller's own storefront — views, revenue, order count. */
export function useStorefrontStats() {
  return useQuery({
    queryKey: storefrontKeys.stats(),
    queryFn: () => getJSON<StorefrontStats>("/api/storefront/stats"),
    staleTime: 30_000,
  })
}

/**
 * Imperative slug-availability check. Returns a stable function — call it
 * with a candidate slug to fetch availability. Caches per-slug via TanStack
 * Query so repeated checks of the same string don't re-hit the network.
 */
export function useCheckSlug() {
  const qc = useQueryClient()
  return useCallback(
    (slug: string) =>
      qc.fetchQuery({
        queryKey: storefrontKeys.slugCheck(slug),
        queryFn: () =>
          getJSON<{ available: boolean }>(`/api/storefront/check-slug/${slug}`),
        staleTime: 60_000,
      }),
    [qc],
  )
}

// ─── Drafts / publish / closed-state ─────────────────────────────────────────

export const draftKeys = {
  all: ["storefront", "drafts"] as const,
  list: () => [...draftKeys.all, "list"] as const,
  one: (id: string) => [...draftKeys.all, "one", id] as const,
}

export function useDrafts() {
  return useQuery({
    queryKey: draftKeys.list(),
    queryFn: () =>
      getJSON<{ drafts: StorefrontDraft[] }>("/api/storefront/drafts"),
    select: (d) => d.drafts,
  })
}

export function useDraft(id: string | null | undefined) {
  return useQuery({
    queryKey: draftKeys.one(id ?? ""),
    queryFn: () =>
      getJSON<{ draft: StorefrontDraft }>(`/api/storefront/drafts/${id}`),
    enabled: !!id,
    select: (d) => d.draft,
  })
}

export function useCreateDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      name: string
      description?: string | null
      seedFromLive?: boolean
      content?: Partial<DraftContent>
    }) =>
      postJSON<typeof body, { draft: StorefrontDraft }>(
        "/api/storefront/drafts",
        body,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: draftKeys.list() }),
  })
}

export function useUpdateDraft(id: string) {
  const qc = useQueryClient()
  type UpdateBody = {
    name?: string
    description?: string | null
    content?: Partial<DraftContent>
  }
  type ListEnvelope = { drafts: StorefrontDraft[] }
  type OneEnvelope = { draft: StorefrontDraft }
  type Ctx = { prevList?: ListEnvelope; prevOne?: OneEnvelope }

  return useMutation<{ draft: StorefrontDraft }, Error, UpdateBody, Ctx>({
    mutationFn: (body) =>
      patchJSONBody<UpdateBody, { draft: StorefrontDraft }>(
        `/api/storefront/drafts/${id}`,
        body,
      ),
    // Optimistic update — snapshot the previous cache, apply the requested
    // patch in-place so the dropdown row + active-draft consumer reflect
    // the new name/notes immediately. The modal closes instantly without
    // waiting for the server.
    onMutate: async (body) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: draftKeys.list() }),
        qc.cancelQueries({ queryKey: draftKeys.one(id) }),
      ])
      const prevList = qc.getQueryData<ListEnvelope>(draftKeys.list())
      const prevOne = qc.getQueryData<OneEnvelope>(draftKeys.one(id))

      const nowIso = new Date()
      const applyPatch = (draft: StorefrontDraft): StorefrontDraft => ({
        ...draft,
        name: body.name ?? draft.name,
        description:
          body.description !== undefined ? body.description : draft.description,
        content: body.content
          ? { ...draft.content, ...body.content }
          : draft.content,
        updatedAt: nowIso,
      })

      if (prevList) {
        qc.setQueryData<ListEnvelope>(draftKeys.list(), {
          drafts: prevList.drafts.map((d) => (d.id === id ? applyPatch(d) : d)),
        })
      }
      if (prevOne) {
        qc.setQueryData<OneEnvelope>(draftKeys.one(id), {
          draft: applyPatch(prevOne.draft),
        })
      }
      return { prevList, prevOne }
    },
    // Server rejected — roll back to the snapshot so the seller doesn't see
    // their failed edit lingering in the list.
    onError: (_err, _body, ctx) => {
      if (ctx?.prevList) qc.setQueryData(draftKeys.list(), ctx.prevList)
      if (ctx?.prevOne) qc.setQueryData(draftKeys.one(id), ctx.prevOne)
    },
    onSuccess: (data) => {
      qc.setQueryData<OneEnvelope>(draftKeys.one(id), { draft: data.draft })
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: draftKeys.list() })
      qc.invalidateQueries({ queryKey: draftKeys.one(id) })
    },
  })
}

export function useDeleteDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteJSON(`/api/storefront/drafts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: draftKeys.list() }),
  })
}

export function usePublishDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      postJSON<undefined, { storefront: Storefront }>(
        `/api/storefront/drafts/${id}/publish`,
      ),
    onSuccess: (data) => {
      qc.setQueryData(storefrontKeys.current(), data.storefront)
      qc.invalidateQueries({ queryKey: storefrontKeys.current() })
    },
  })
}

export function usePreviewToken(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (enabled: boolean) =>
      postJSON<{ enabled: boolean }, { previewToken: string | null }>(
        `/api/storefront/drafts/${id}/preview-token`,
        { enabled },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: draftKeys.one(id) })
      qc.invalidateQueries({ queryKey: draftKeys.list() })
    },
  })
}

export function useUnpublish() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      postJSON<undefined, { storefront: Storefront }>(
        "/api/storefront/unpublish",
      ),
    onSuccess: (data) =>
      qc.setQueryData(storefrontKeys.current(), data.storefront),
  })
}

export function useUpdateClosedState() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      closedHeadline?: string | null
      closedMessage?: string | null
      closedShowSocials?: boolean
    }) =>
      patchJSONBody<typeof body, { storefront: Storefront }>(
        "/api/storefront/closed-state",
        body,
      ),
    onSuccess: (data) =>
      qc.setQueryData(storefrontKeys.current(), data.storefront),
  })
}

