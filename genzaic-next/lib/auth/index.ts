import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { db, users, sessions } from "@/lib/db"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { loginSchema } from "@/lib/validations/auth"
import { randomBytes } from "crypto"

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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
          isSeller: user.isSeller,
          storeUrl: user.storeUrl,
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
        token.role = (user as any).role
        token.isSeller = (user as any).isSeller
        token.storeUrl = (user as any).storeUrl
        token.planType = (user as any).planType
        token.kycStatus = (user as any).kycStatus
        token.onboardingComplete = (user as any).onboardingComplete
      }
      if (trigger === "update" && session) {
        return { ...token, ...session.user }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        ;(session.user as any).isSeller = token.isSeller
        ;(session.user as any).storeUrl = token.storeUrl
        ;(session.user as any).planType = token.planType
        ;(session.user as any).kycStatus = token.kycStatus
        ;(session.user as any).onboardingComplete = token.onboardingComplete
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
