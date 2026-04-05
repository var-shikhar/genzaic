import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM || "noreply@genzaic.com"

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

export async function sendOrderConfirmationEmail(
  buyerEmail: string,
  buyerName: string,
  productTitle: string,
  orderId: string,
  downloadLink: string
) {
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
          <p style="margin: 0; color: #374151;"><strong>Order ID:</strong> ${orderId}</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${downloadLink}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Access Your Purchase</a>
        </div>
      </div>
    `,
  })
}
