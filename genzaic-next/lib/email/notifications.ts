import "server-only"
import { Resend } from "resend"
import { env } from "@/lib/env"
import type { Notification } from "@/lib/db"

const resend = new Resend(env.RESEND_API_KEY)

export async function sendGenericNotificationEmail(params: {
  toEmail: string
  toName: string
  notification: Pick<Notification, "title" | "message" | "link">
}) {
  const { toEmail, toName, notification } = params
  const cta = notification.link
    ? `
        <div style="text-align: center; margin: 32px 0;">
          <a href="${new URL(notification.link, env.NEXT_PUBLIC_APP_URL).toString()}"
             style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Open in dashboard
          </a>
        </div>`
    : ""

  return resend.emails.send({
    from: env.EMAIL_FROM,
    to: toEmail,
    subject: notification.title,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">GenZaic</h1>
        </div>
        <h2 style="color: #1f2937;">Hi ${toName},</h2>
        <p style="color: #6b7280; line-height: 1.5;">${notification.message}</p>
        ${cta}
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
          You can manage notification preferences in your settings.
        </p>
      </div>
    `,
  })
}
