import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db, users, storefronts } from "@/lib/db"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { loginSchema } from "@/lib/validations/auth"
import { authConfig } from "@/lib/auth/config"
import { notifyEvent } from "@/lib/notifications/notify"

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

        // Run lastLoginAt update + storefront lookup in parallel — they're
        // independent and both add ~100-300ms each on Neon serverless.
        const [, storefrontRows] = await Promise.all([
          db
            .update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user.id)),
          db
            .select({ storeUrl: storefronts.storeUrl })
            .from(storefronts)
            .where(eq(storefronts.userId, user.id))
            .limit(1),
        ])
        const storefront = storefrontRows[0]

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
      if (account?.provider !== "google") return true

      let [dbUser] = await db.select().from(users).where(eq(users.email, user.email!)).limit(1)

      if (!dbUser) {
        const [inserted] = await db
          .insert(users)
          .values({
            email: user.email!,
            name: user.name!,
            avatarUrl: user.image,
            emailVerified: true,
            role: "seller",
            isSeller: true,
            lastLoginAt: new Date(),
          })
          .returning()
        dbUser = inserted

        // Mirror the welcome notification emitted by the email/password signup
        // route so Google-signup users get the same first-touch as everyone else.
        try {
          await notifyEvent({
            userId: dbUser.id,
            type: "welcome",
            title: "Welcome to GenZaic 🎉",
            message:
              "Glad to have you. Browse the marketplace or start your seller setup any time.",
            link: "/",
            suppress: { email: true },
          })
        } catch (err) {
          console.error("[notifications] welcome emit failed:", err)
        }
      } else {
        if (!dbUser.isActive) return false
        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, dbUser.id))
      }

      const [storefront] = await db
        .select({ storeUrl: storefronts.storeUrl })
        .from(storefronts)
        .where(eq(storefronts.userId, dbUser.id))
        .limit(1)

      // Mutate the user object so the jwt callback hydrates token.* from DB
      // values (role/isSeller/onboardingComplete/etc.) instead of the bare
      // Google profile — keeps post-login redirects consistent with Credentials.
      user.id = dbUser.id
      user.name = dbUser.name
      user.image = dbUser.avatarUrl
      Object.assign(user, {
        role: dbUser.role,
        isSeller: dbUser.isSeller,
        storeUrl: storefront?.storeUrl ?? null,
        planType: dbUser.planType,
        kycStatus: dbUser.kycStatus,
        onboardingComplete: dbUser.onboardingComplete,
      })

      return true
    },
  },
})
