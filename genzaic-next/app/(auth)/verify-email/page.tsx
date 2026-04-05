"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Mail, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useVerifyOTPMutation, useResendOTPMutation } from "@/store/api/authApi"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [otp, setOtp] = useState("")
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation()
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation()

  useEffect(() => {
    if (!email) {
      router.push("/signup")
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email, router])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP")
      return
    }

    try {
      await verifyOTP({ email, otp }).unwrap()
      toast.success("Email verified successfully!")
      router.push("/login?verified=true")
    } catch (error: any) {
      const message = error?.data?.message || "Invalid or expired OTP. Please try again."
      toast.error(message)
      setOtp("")
    }
  }

  const handleResend = async () => {
    try {
      await resendOTP({ email }).unwrap()
      toast.success("New OTP sent to your email!")
      setCountdown(60)
      setCanResend(false)
      setOtp("")

      // Restart countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      const message = error?.data?.message || "Failed to resend OTP. Please try again."
      toast.error(message)
    }
  }

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(b.length) + c)
    : ""

  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
        <Mail className="w-8 h-8 text-primary" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
        <p className="text-muted-foreground text-sm">
          We sent a 6-digit verification code to
        </p>
        <p className="font-medium text-foreground">{maskedEmail}</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          onClick={handleVerify}
          className="w-full h-11 gradient-primary hover:opacity-90 transition-opacity"
          disabled={isVerifying || otp.length !== 6}
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Didn't receive the code?</p>

        {canResend ? (
          <Button
            variant="ghost"
            onClick={handleResend}
            disabled={isResending}
            className="h-9 gap-2"
          >
            {isResending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Resend Code
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Resend in{" "}
            <span className="font-medium text-primary tabular-nums">{countdown}s</span>
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Wrong email?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="text-primary hover:underline"
          >
            Go back to signup
          </button>
        </p>
      </div>
    </div>
  )
}
