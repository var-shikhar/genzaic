"use client"

import { useQuery } from "@tanstack/react-query"
import { getJSON } from "@/lib/react-query/fetcher"
import { MonoLabel } from "@/components/brand/primitives"
import { EditorsHeadline } from "@/components/brand/primitives"
import { EMPTY } from "@/lib/brand/voice"

interface ReaderReview {
  id: string
  authorName: string | null
  rating: number
  comment: string
  productTitle: string
  createdAt: string
}

function useRecentReviews() {
  return useQuery({
    queryKey: ["dashboard", "reader-mail"],
    queryFn: async () => {
      try {
        const res = await getJSON<{ reviews: ReaderReview[] }>("/api/reviews/recent?limit=3")
        return res.reviews
      } catch {
        return [] as ReaderReview[]
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86_400_000)
  if (d > 0) return `${d}d ago`
  const h = Math.floor(diff / 3_600_000)
  if (h > 0) return `${h}h ago`
  return "just now"
}

export function ReaderMail() {
  const { data } = useRecentReviews()
  const reviews = data ?? []

  return (
    <section>
      <h2 className="font-display italic text-lg text-muted-foreground font-medium mb-3">Reader mail —</h2>
      {reviews.length === 0 ? (
        <div>
          <EditorsHeadline size="md" as="h3">{EMPTY.readerMail.headline}</EditorsHeadline>
          <p className="font-display italic text-muted-foreground mt-1">{EMPTY.readerMail.sub}</p>
        </div>
      ) : (
        <ul>
          {reviews.map((r, i) => (
            <li
              key={r.id}
              className={i < reviews.length - 1 ? "py-3 border-b border-foreground/10" : "py-3"}
            >
              <MonoLabel size="xs" className="block mb-1">
                {(r.authorName ?? "Anonymous").split(" ")[0]} · {timeAgo(r.createdAt)} · {r.productTitle}
              </MonoLabel>
              <p className="font-display italic text-[15px] leading-snug">
                <span className="text-primary text-[28px] leading-none align-[-0.4em] mr-0.5">&ldquo;</span>
                {r.comment}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
