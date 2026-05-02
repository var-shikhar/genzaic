import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db, users, storefronts } from "@/lib/db"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { loginSchema } from "@/lib/validations/auth"
import { authConfig } from "@/lib/auth/config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
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
    ...authConfig.callbacks,
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
})
