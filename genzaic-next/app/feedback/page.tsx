import { FeedbackForm } from "@/components/feedback/FeedbackForm"
import Footer from "@/components/layout/Footer"
import { Logo } from "@/components/ui/logo"
import { auth } from "@/lib/auth"
import { LayoutDashboard, MessageSquarePlus, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Feedback | GenZaic",
  description: "Request a feature or report a bug to help us improve GenZaic.",
}

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login?callbackUrl=/feedback")
  }

  // Same extended shape the buyer/seller layouts use — drives the header's
  // dashboard shortcut and the profile menu.
  const user = session.user as {
    name?: string | null
    email?: string | null
    image?: string | null
    isSeller?: boolean
    role?: string
  }
  const isSeller = user.isSeller === true || user.role === "seller"

  const { type } = await searchParams
  const defaultTab = type === "bug" ? "bug_report" : "feature_request"

  return (
    <div className="min-h-screen bg-background">
      {/* Authenticated header — this page is logged-in only, so it shows a
          single dashboard shortcut rather than the public Login / Get Started
          header. No notification bell or profile menu here by design. */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo width={100} height={20} />
          </Link>
          <Link
            href={isSeller ? "/dashboard" : "/my-purchases"}
            className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
          >
            {isSeller ? (
              <LayoutDashboard className="h-4 w-4" />
            ) : (
              <ShoppingBag className="h-4 w-4" />
            )}
            {isSeller ? "Dashboard" : "My Purchases"}
          </Link>
        </div>
      </header>

      <section className="py-14 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/40 to-background" />
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="container mx-auto relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <MessageSquarePlus className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              We&apos;re listening
            </span>
          </div>
          <h1 className="font-bold text-3xl md:text-4xl text-foreground mb-3 leading-tight">
            Share your feedback
          </h1>
          <p className="text-muted-foreground">
            Got an idea or hit a snag? Tell us — every submission reaches the
            team.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="container mx-auto max-w-2xl">
          <FeedbackForm defaultTab={defaultTab} />
        </div>
      </section>

      <Footer />
    </div>
  )
}
