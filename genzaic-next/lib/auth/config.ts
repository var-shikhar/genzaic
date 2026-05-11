import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

interface ExtendedUser {
  role?: string
  isSeller?: boolean
  storeUrl?: string | null
  planType?: string | null
  kycStatus?: string | null
  onboardingComplete?: boolean
}

export const authConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as ExtendedUser).role
        token.isSeller = (user as ExtendedUser).isSeller
        token.storeUrl = (user as ExtendedUser).storeUrl
        token.planType = (user as ExtendedUser).planType
        token.kycStatus = (user as ExtendedUser).kycStatus
        token.onboardingComplete = (user as ExtendedUser).onboardingComplete
      }
      if (trigger === "update" && session) {
        const next = { ...token, ...session.user }
        // NextAuth derives session.user.image from token.picture on reload, so
        // mirror image -> picture to keep the avatar after a hard refresh.
        if (session.user?.image !== undefined) next.picture = session.user.image
        return next
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as ExtendedUser).role = token.role as string
        ;(session.user as ExtendedUser).isSeller = token.isSeller as boolean
        ;(session.user as ExtendedUser).storeUrl = token.storeUrl as string | null
        ;(session.user as ExtendedUser).planType = token.planType as string | null
        ;(session.user as ExtendedUser).kycStatus = token.kycStatus as string | null
        ;(session.user as ExtendedUser).onboardingComplete = token.onboardingComplete as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig
