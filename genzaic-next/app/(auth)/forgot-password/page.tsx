"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth"
import { useForgotPasswordMutation } from "@/store/api/authApi"

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState("")

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await forgotPassword({ email: data.email }).unwrap()
      setSentToEmail(data.email)
      setEmailSent(true)
      toast.success("Password reset link sent!")
    } catch (error: any) {
      const message = error?.data?.message || "Failed to send reset link. Please try again."
      toast.error(message)
    }
  }

  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Check your inbox</h1>
          <p className="text-muted-foreground text-sm">
            We sent a password reset link to
          </p>
          <p className="font-medium text-foreground">{sentToEmail}</p>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Didn't receive it?</span> Check your spam folder
            or click the button below to try again.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => setEmailSent(false)}
            variant="outline"
            className="w-full h-11"
          >
            Try a different email
          </Button>
          <Link href="/login">
            <Button variant="ghost" className="w-full h-11 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 gradient-primary hover:opacity-90 transition-opacity"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending reset link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <Link href="/login">
        <Button variant="ghost" className="w-full h-11 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Button>
      </Link>
    </div>
  )
}
