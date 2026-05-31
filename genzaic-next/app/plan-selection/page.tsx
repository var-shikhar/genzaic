import { redirect } from "next/navigation"

// Legacy entry point for buyer → seller upgrades. The unified plan + onboarding
// flow now lives at /onboarding; this page preserves the URL for anyone with a
// bookmark or stale link and forwards them on.
export default function PlanSelectionPage() {
  redirect("/onboarding")
}
