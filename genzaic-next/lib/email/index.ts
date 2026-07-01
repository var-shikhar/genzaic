import { Resend } from "resend"
import { env } from "@/lib/env"
import {
  buildFeedbackAdminEmail,
  type FeedbackEmailParams,
} from "./feedback-email"

const resend = new Resend(env.RESEND_API_KEY)

const FROM = env.EMAIL_FROM

export async function sendVerificationEmail(email: string, name: string, otp: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your GenZaic account",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">GenZaic</h1>
        </div>
        <h2 style="color: #1f2937;">Hi ${name},</h2>
        <p style="color: #6b7280;">Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <span style="font-size: 40px; font-weight: bold; color: #6366f1; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #6b7280;">This code expires in 10 minutes. Do not share it with anyone.</p>
        <p style="color: #9ca3af; font-size: 14px;">If you didn't create a GenZaic account, ignore this email.</p>
      </div>
    `,
  })
}

/**
 * Welcome email — fires once when a creator finishes /onboarding. Introduces
 * the key things they can do on GenZaic so they're not staring at an empty
 * dashboard wondering where to start. Guarded by the complete-onboarding
 * endpoint so it only sends on the first completion, not on retries.
 */
export async function sendWelcomeEmail(email: string, name: string) {
  const dashboardUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard`
  const addProductUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/products/new`
  const storefrontUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/storefront`
  const kycUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/kyc`

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to GenZaic — let's get your store live",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to GenZaic ✨</h1>
        </div>
        <h2 style="margin: 0 0 8px;">Hi ${name},</h2>
        <p style="color: #6b7280; line-height: 1.6;">
          You're all set up. GenZaic gives Indian creators everything you need to sell digital products —
          PDFs, templates, code, courses — and get paid directly to your bank via UPI or cards.
        </p>
        <p style="color: #6b7280; line-height: 1.6;">Here's how to get rolling:</p>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px; margin: 14px 0;">
          <p style="margin: 0 0 4px; font-weight: 600;">1. Add your first product</p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Upload a file, set a price, and we'll handle delivery and access for your buyers.</p>
          <a href="${addProductUrl}" style="display: inline-block; margin-top: 8px; color: #6366f1; font-weight: 600; text-decoration: none;">Add a product →</a>
        </div>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px; margin: 14px 0;">
          <p style="margin: 0 0 4px; font-weight: 600;">2. Customize your storefront</p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Pick a theme, add your bio, and share your store link anywhere.</p>
          <a href="${storefrontUrl}" style="display: inline-block; margin-top: 8px; color: #6366f1; font-weight: 600; text-decoration: none;">Customize storefront →</a>
        </div>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px; margin: 14px 0;">
          <p style="margin: 0 0 4px; font-weight: 600;">3. Finish KYC to unlock payouts</p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Verify your bank and UPI so we can transfer your earnings.</p>
          <a href="${kycUrl}" style="display: inline-block; margin-top: 8px; color: #6366f1; font-weight: 600; text-decoration: none;">Complete KYC →</a>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Open dashboard</a>
        </div>

        <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
          Stuck or have questions? Just reply to this email — a human reads every one.
        </p>
        <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">— Team GenZaic</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your GenZaic password",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">GenZaic</h1>
        </div>
        <h2 style="color: #1f2937;">Hi ${name},</h2>
        <p style="color: #6b7280;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #9ca3af; font-size: 14px;">If you didn't request this, ignore this email. Your password won't change.</p>
      </div>
    `,
  })
}

// Re-export the pure outcome-derivation helper so callers can do everything
// KYC-email-related from a single import path.
export {
  deriveKycRazorpayEmailOutcome,
  type KycRazorpayEmailOutcome,
} from "./kyc-email"

// Re-export the pure feedback-email builder alongside its sender.
export { buildFeedbackAdminEmail, type FeedbackEmailParams } from "./feedback-email"

/**
 * Alert the team about a new feature request / bug report. Sent to the
 * configured FEEDBACK_NOTIFY_EMAIL inbox. The submitter's email is set as
 * `replyTo` so a team member can respond to them directly.
 */
export async function sendFeedbackAdminEmail(params: FeedbackEmailParams) {
  const { subject, html } = buildFeedbackAdminEmail(params)
  return resend.emails.send({
    from: FROM,
    to: env.FEEDBACK_NOTIFY_EMAIL,
    replyTo: params.submitterEmail,
    subject,
    html,
  })
}

/**
 * Email sent at the end of the background Razorpay phase. Two variants based
 * on outcome — see deriveKycRazorpayEmailOutcome.
 */
export async function sendKycRazorpayResultEmail(
  email: string,
  name: string,
  outcome: "passed" | "rejected",
  rejectionReason?: string | null,
) {
  const dashboardUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/kyc`

  if (outcome === "passed") {
    return resend.emails.send({
      from: FROM,
      to: email,
      subject: "Your KYC is being reviewed",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">GenZaic</h1>
          </div>
          <h2 style="color: #1f2937;">Hi ${name},</h2>
          <p style="color: #6b7280;">We've verified your bank and UPI details. Our team is now reviewing the documents you submitted.</p>
          <p style="color: #6b7280;">You'll hear back from us in <strong>1–2 business days</strong> with the final decision. No action needed from you right now.</p>
          <p style="color: #9ca3af; font-size: 14px;">— Team GenZaic</p>
        </div>
      `,
    })
  }

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Action needed on your KYC",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">GenZaic</h1>
        </div>
        <h2 style="color: #1f2937;">Hi ${name},</h2>
        <p style="color: #6b7280;">We couldn't verify your KYC details:</p>
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; color: #991b1b;">${rejectionReason ?? "Verification failed. Please review and resubmit."}</p>
        </div>
        <p style="color: #6b7280;">Update the affected section and we'll re-run verification automatically.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Fix &amp; resubmit</a>
        </div>
        <p style="color: #9ca3af; font-size: 14px;">— Team GenZaic</p>
      </div>
    `,
  })
}

/**
 * Email sent after an operator approves or rejects KYC during document
 * review. NOT wired yet — call site lives in the future admin endpoint.
 * Defined here so the future PR is a one-line wire-up.
 */
export async function sendKycAdminDecisionEmail(
  email: string,
  name: string,
  outcome: "verified" | "rejected",
  rejectionReason?: string | null,
) {
  const dashboardUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/kyc`

  if (outcome === "verified") {
    return resend.emails.send({
      from: FROM,
      to: email,
      subject: "Your KYC is verified",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">GenZaic</h1>
          </div>
          <h2 style="color: #1f2937;">Hi ${name},</h2>
          <p style="color: #6b7280;">Your identity is on file. Payouts above ₹10k are unlocked.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Open dashboard</a>
          </div>
          <p style="color: #9ca3af; font-size: 14px;">— Team GenZaic</p>
        </div>
      `,
    })
  }

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your KYC was rejected",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">GenZaic</h1>
        </div>
        <h2 style="color: #1f2937;">Hi ${name},</h2>
        <p style="color: #6b7280;">Our team reviewed your documents and couldn't verify your KYC:</p>
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; color: #991b1b;">${rejectionReason ?? "Verification failed. Please review and resubmit."}</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Fix &amp; resubmit</a>
        </div>
        <p style="color: #9ca3af; font-size: 14px;">— Team GenZaic</p>
      </div>
    `,
  })
}

/**
 * Order-confirmation email.
 *
 * Two CTAs:
 *  1. Primary — "Access your purchase" → the order page with a fresh,
 *     time-limited access token. Always present.
 *  2. Secondary — "Set up your password" → only included when we
 *     auto-created a buyer account for this email at checkout. Lets the
 *     buyer claim the account so they can log in later and see all their
 *     purchases under My Purchases.
 */
export async function sendOrderConfirmationEmail(params: {
  buyerEmail: string
  buyerName: string
  productTitle: string
  orderNumber: string
  accessUrl: string
  /** Only set for newly-auto-created buyer accounts. */
  passwordSetupUrl?: string
}) {
  const {
    buyerEmail,
    buyerName,
    productTitle,
    orderNumber,
    accessUrl,
    passwordSetupUrl,
  } = params

  const setupBlock = passwordSetupUrl
    ? `
        <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px;">
          <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 8px;">Want to track future purchases?</h3>
          <p style="color: #6b7280; margin: 0 0 16px;">We've reserved an account for you under <strong>${buyerEmail}</strong>. Set up a password and you'll be able to see all your purchases under My Purchases.</p>
          <div style="text-align: center;">
            <a href="${passwordSetupUrl}" style="display: inline-block; background: #ffffff; color: #6366f1; border: 1px solid #c7d2fe; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Set up your password</a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 12px; text-align: center;">This link is valid for 24 hours.</p>
        </div>
      `
    : ""

  return resend.emails.send({
    from: FROM,
    to: buyerEmail,
    subject: `Your purchase: ${productTitle}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">GenZaic</h1>
        </div>
        <h2 style="color: #1f2937;">Thank you, ${buyerName}!</h2>
        <p style="color: #6b7280;">Your purchase of <strong>${productTitle}</strong> was successful.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; color: #374151;"><strong>Order #</strong> ${orderNumber}</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${accessUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Access your purchase</a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">This link is valid for 24 hours. If it expires, log in to see your purchase under My Purchases.</p>
        ${setupBlock}
      </div>
    `,
  })
}
