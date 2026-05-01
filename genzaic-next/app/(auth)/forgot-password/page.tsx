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
import { useForgotPassword } from "@/lib/queries/auth"
import { getApiErrorMessage } from "@/lib/api-error"

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState("")

  const { mutateAsync: forgotPassword, isPending: isLoading } = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await forgotPassword({ email: data.email })
      setSentToEmail(data.email)
      setEmailSent(true)
      toast.success("Password reset link sent!")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to send reset link. Please try again."))
    }
  }

  if (emailSent) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Check your inbox</h1>
          <p className="text-muted-foreground text-sm">
            We sent a password reset link to
          </p>
          <p className="font-medium text-foreground text-sm">{sentToEmail}</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 text-left">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Didn&apos;t receive it?</span> Check your spam folder
            or click below to try again.
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => setEmailSent(false)}
            variant="outline"
            className="w-full h-10 text-sm"
          >
            Try a different email
          </Button>
          <Link href="/login">
            <Button variant="ghost" className="w-full h-9 gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Forgot password?</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            {...register("email")}
            className={`h-9 text-sm ${errors.email ? "border-destructive" : ""}`}
          />
          {errors.email && (
            <p className="text-[10px] text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-10 gradient-primary hover:opacity-90 transition-opacity text-sm"
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
        <Button variant="ghost" className="w-full h-9 gap-1.5 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to login
        </Button>
      </Link>
    </div>
  )
}
