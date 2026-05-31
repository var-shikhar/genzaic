import "server-only"
import { sendGenericNotificationEmail } from "@/lib/email/notifications"
import type { Notification } from "@/lib/db"

type EmailRecipient = { email: string; name: string | null }

export async function dispatchEmail(
  notif: Notification,
  user: EmailRecipient,
): Promise<void> {
  const toName = user.name?.trim() || user.email.split("@")[0]
  await sendGenericNotificationEmail({
    toEmail: user.email,
    toName,
    notification: {
      title: notif.title,
      message: notif.message,
      link: notif.link,
    },
  })
}
