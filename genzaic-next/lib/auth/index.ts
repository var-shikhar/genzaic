import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { db, users, sessions, storefronts } from "@/lib/db"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { loginSchema } from "@/lib/validations/auth"
import { randomBytes } from "crypto"

interface ExtendedUser {
  role?: string
  isSeller?: boolean
  storeUrl?: string | null
  planType?: string | null
  kycStatus?: string | null
  onboardingComplete?: boolean
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
        if (!user || !user.passwordHash) return null
        if (!user.isActive) return null
        if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED")

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) return null

        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, user.id))

        const [storefront] = await db
          .select({ storeUrl: storefronts.storeUrl })
          .from(storefronts)
          .where(eq(storefronts.userId, user.id))
          .limit(1)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
          isSeller: user.isSeller,
          storeUrl: storefront?.storeUrl ?? null,
          planType: user.planType,
          kycStatus: user.kycStatus,
          onboardingComplete: user.onboardingComplete,
        }
      },
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
        return { ...token, ...session.user }
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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const [existing] = await db.select().from(users).where(eq(users.email, user.email!)).limit(1)
        if (!existing) {
          await db.insert(users).values({
            email: user.email!,
            name: user.name!,
            avatarUrl: user.image,
            emailVerified: true,
            role: "buyer",
          })
        }
      }
      return true
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
})
