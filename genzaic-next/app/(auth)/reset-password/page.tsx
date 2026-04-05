"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth"
import { useResetPasswordMutation } from "@/store/api/authApi"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [success, setSuccess] = useState(false)

  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      await resetPassword({ token: data.token, password: data.password }).unwrap()
      setSuccess(true)
      toast.success("Password reset successfully!")
      setTimeout(() => router.push("/login"), 2000)
    } catch (err) {
      const error = err as { data?: { error?: string } }
      toast.error(error?.data?.error || "Failed to reset password. The link may have expired.")
    }
  }

  if (!token) {
    return (
      <div className="space-y-5 text-center">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Invalid Reset Link</h1>
        <p className="text-muted-foreground text-sm">
          This password reset link is invalid or missing a token.
        </p>
        <Link href="/forgot-password">
          <Button className="w-full h-10 gradient-primary text-sm">Request a new reset link</Button>
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Password reset!</h1>
          <p className="text-muted-foreground text-sm">
            Your password has been updated. Redirecting to login...
          </p>
        </div>
        <Link href="/login">
          <Button className="w-full h-10 gradient-primary text-sm">Go to Login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
          <KeyRound className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Set new password</h1>
        <p className="text-muted-foreground text-sm">
          Enter a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input type="hidden" {...register("token")} />

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min 8 chars, 1 upper, 1 number"
            autoFocus
            {...register("password")}
            className={`h-9 text-sm ${errors.password ? "border-destructive" : ""}`}
          />
          {errors.password && (
            <p className="text-[10px] text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            {...register("confirmPassword")}
            className={`h-9 text-sm ${errors.confirmPassword ? "border-destructive" : ""}`}
          />
          {errors.confirmPassword && (
            <p className="text-[10px] text-destructive">{errors.confirmPassword.message}</p>
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
              Resetting password...
            </>
          ) : (
            "Reset Password"
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
