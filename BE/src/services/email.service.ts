/**
 * Email Service
 * Handles sending emails using Nodemailer with Handlebars templates
 * Supports Ethereal (dev), SMTP, SendGrid, and Resend
 */

import nodemailer, { Transporter } from "nodemailer"
import { Resend } from "resend"
import { promises as fs } from "fs"
import path from "path"
import Handlebars from "handlebars"
import { env } from "@/config/environment"
import { emailConfig } from "@/config/email"
import { logger } from "@/utils/logger"

export class EmailService {
  private static transporter: Transporter
  private static resendClient: Resend | null = null
  private static isInitialized = false

  /**
   * Initialize email service with appropriate transport
   */
  static async initialize() {
    if (this.isInitialized) {
      return
    }


    try {
      if (emailConfig.service === "ethereal") {
        // Ethereal for development/testing
        const testAccount = await nodemailer.createTestAccount()

        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        })

        logger.info("📧 Email service initialized with Ethereal (test mode)")
        logger.info(`📧 Ethereal user: ${testAccount.user}`)
      } else if (emailConfig.service === "smtp" && emailConfig.smtp) {
        // SMTP for production
        this.transporter = nodemailer.createTransport({
          host: emailConfig.smtp.host,
          port: emailConfig.smtp.port,
          secure: emailConfig.smtp.secure,
          auth: {
            user: emailConfig.smtp.auth.user,
            pass: emailConfig.smtp.auth.pass,
          },
          requireTLS: true,
        })

        logger.info("📧 Email service initialized with SMTP")
      } else if (emailConfig.service === "sendgrid" && emailConfig.sendgrid) {
        // SendGrid for production
        this.transporter = nodemailer.createTransport({
          host: "smtp.sendgrid.net",
          port: 587,
          auth: {
            user: "apikey",
            pass: emailConfig.sendgrid.apiKey,
          },
        })

        logger.info("📧 Email service initialized with SendGrid")
      } else if (emailConfig.service === "resend" && emailConfig.resend) {
        // Resend for production
        this.resendClient = new Resend(emailConfig.resend.apiKey)
        
        logger.info("📧 Email service initialized with Resend")
      } else {
        throw new Error("Invalid email service configuration")
      }

      // Verify connection (skip for Resend as it doesn't have a verify method)
      if (emailConfig.service !== "resend") {
        await this.transporter.verify()
      }
      this.isInitialized = true
      logger.info("✅ Email service verified and ready")
    } catch (error) {
      logger.error("❌ Failed to initialize email service:", error)
      throw error
    }
  }

  /**
   * Load and compile Handlebars template
   */
  private static async loadTemplate(
    templateName: string,
    data: Record<string, any>
  ): Promise<string> {
    try {
      const templatePath = path.join(
        process.cwd(),
        "src",
        "templates",
        "email",
        `${templateName}.hbs`
      )

      const templateSource = await fs.readFile(templatePath, "utf-8")
      const template = Handlebars.compile(templateSource)

      return template(data)
    } catch (error) {
      logger.error(`Failed to load email template: ${templateName}`, error)
      throw new Error(`Email template '${templateName}' not found`)
    }
  }

  /**
   * Send email via Resend
   */
  private static async sendViaResend(
    to: string,
    subject: string,
    html: string
  ) {
    if (!this.resendClient) {
      throw new Error("Resend client not initialized")
    }

    try {
      const { data, error } = await this.resendClient.emails.send({
        from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
        to,
        subject,
        html,
      })

      if (error) {
        logger.error(`❌ Resend API error:`, error)
        throw new Error(`Resend API error: ${error.message}`)
      }

      logger.info(`✅ Email sent via Resend to ${to}`)
      logger.info(`📧 Message ID: ${data?.id}`)

      return { messageId: data?.id }
    } catch (error) {
      logger.error(`❌ Failed to send email via Resend:`, error)
      throw error
    }
  }

  /**
   * Send email verification OTP
   */
  static async sendVerificationEmail(email: string, name: string, otp: string) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const html = await this.loadTemplate("verification", {
      name,
      otp,
      platformName: env.PLATFORM_NAME,
      platformUrl: env.PLATFORM_URL,
      expiryMinutes: env.OTP_EXPIRY_MINUTES,
    })

    const subject = `Verify Your Email - ${env.PLATFORM_NAME}`

    try {
      // Use Resend if configured
      if (emailConfig.service === "resend") {
        const result = await this.sendViaResend(email, subject, html)
        logger.info(`📧 OTP: ${otp}`)
        return result
      }

      // Otherwise use Nodemailer
      const mailOptions = {
        from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
        to: email,
        subject,
        html,
      }

      const info = await this.transporter.sendMail(mailOptions)

      logger.info(`✅ Verification email sent to ${email}`)
      logger.info(`📧 Message ID: ${info.messageId}`)
      logger.info(`📧 OTP: ${otp}`)

      // Log preview URL in development
      if (emailConfig.service === "ethereal") {
        const previewUrl = nodemailer.getTestMessageUrl(info)
        logger.info(`📧 Preview URL: ${previewUrl}`)
        return { messageId: info.messageId, previewUrl }
      }

      return { messageId: info.messageId }
    } catch (error) {
      logger.error(`❌ Failed to send verification email to ${email}:`, error)
      throw new Error("Failed to send verification email")
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string
  ) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`

    const html = await this.loadTemplate("reset-password", {
      name,
      resetUrl,
      platformName: env.PLATFORM_NAME,
      platformUrl: env.PLATFORM_URL,
      expiryHours: env.PASSWORD_RESET_EXPIRY_HOURS,
    })

    const subject = `Reset Your Password - ${env.PLATFORM_NAME}`

    try {
      // Use Resend if configured
      if (emailConfig.service === "resend") {
        return await this.sendViaResend(email, subject, html)
      }

      // Otherwise use Nodemailer
      const mailOptions = {
        from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
        to: email,
        subject,
        html,
      }

      const info = await this.transporter.sendMail(mailOptions)

      logger.info(`✅ Password reset email sent to ${email}`)
      logger.info(`📧 Message ID: ${info.messageId}`)

      if (emailConfig.service === "ethereal") {
        const previewUrl = nodemailer.getTestMessageUrl(info)
        logger.info(`📧 Preview URL: ${previewUrl}`)
        return { messageId: info.messageId, previewUrl }
      }

      return { messageId: info.messageId }
    } catch (error) {
      logger.error(`❌ Failed to send password reset email to ${email}:`, error)
      throw new Error("Failed to send password reset email")
    }
  }

  /**
   * Send welcome email after successful verification
   */
  static async sendWelcomeEmail(email: string, name: string, role: string) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const dashboardUrl =
      role === "seller"
        ? `${env.FRONTEND_URL}/dashboard`
        : `${env.FRONTEND_URL}/my-purchases`

    const html = await this.loadTemplate("welcome", {
      name,
      role,
      platformName: env.PLATFORM_NAME,
      platformUrl: env.PLATFORM_URL,
      dashboardUrl,
      isSeller: role === "seller",
    })

    const subject = `Welcome to ${env.PLATFORM_NAME}!`

    try {
      // Use Resend if configured
      if (emailConfig.service === "resend") {
        return await this.sendViaResend(email, subject, html)
      }

      // Otherwise use Nodemailer
      const mailOptions = {
        from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
        to: email,
        subject,
        html,
      }

      const info = await this.transporter.sendMail(mailOptions)

      logger.info(`✅ Welcome email sent to ${email}`)
      logger.info(`📧 Message ID: ${info.messageId}`)

      if (emailConfig.service === "ethereal") {
        const previewUrl = nodemailer.getTestMessageUrl(info)
        logger.info(`📧 Preview URL: ${previewUrl}`)
        return { messageId: info.messageId, previewUrl }
      }

      return { messageId: info.messageId }
    } catch (error) {
      logger.error(`❌ Failed to send welcome email to ${email}:`, error)
      // Don't throw error for welcome email - it's not critical
      logger.warn("Continuing despite welcome email failure")
      return null
    }
  }

  /**
   * Send test email (for debugging)
   */
  static async sendTestEmail(to: string) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const subject = "Test Email from GenZaic"
    const html = "<h1>Test Email</h1><p>If you received this, the email service is working correctly!</p>"

    // Use Resend if configured
    if (emailConfig.service === "resend") {
      return await this.sendViaResend(to, subject, html)
    }

    // Otherwise use Nodemailer
    const mailOptions = {
      from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
      to,
      subject,
      html,
    }

    const info = await this.transporter.sendMail(mailOptions)
    logger.info(`Test email sent: ${info.messageId}`)

    if (emailConfig.service === "ethereal") {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      logger.info(`Preview URL: ${previewUrl}`)
      return { messageId: info.messageId, previewUrl }
    }

    return { messageId: info.messageId }
  }
}

export default EmailService
