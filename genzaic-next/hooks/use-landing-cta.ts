"use client"

import { useSession } from "next-auth/react"

export interface LandingCta {
  isAuthenticated: boolean
  href: string
  label: string
  navLabel: string
  firstName: string | null
}

export function useLandingCta(): LandingCta {
  const { data: session, status } = useSession()

  if (status !== "authenticated" || !session?.user) {
    return {
      isAuthenticated: false,
      href: "/signup",
      label: "Start Selling Free",
      navLabel: "Start Selling",
      firstName: null,
    }
  }

  const user = session.user as {
    name?: string | null
    role?: string
    isSeller?: boolean
    onboardingComplete?: boolean
  }
  const firstName = user.name ? user.name.split(" ")[0] : null
  const isSeller = user.role === "seller" || user.isSeller

  if (isSeller) {
    if (!user.onboardingComplete) {
      return {
        isAuthenticated: true,
        href: "/onboarding",
        label: "Continue Setup",
        navLabel: "Continue Setup",
        firstName,
      }
    }
    return {
      isAuthenticated: true,
      href: "/dashboard",
      label: "Go to Dashboard",
      navLabel: "Dashboard",
      firstName,
    }
  }

  return {
    isAuthenticated: true,
    href: "/my-purchases",
    label: "My Purchases",
    navLabel: "My Purchases",
    firstName,
  }
}
