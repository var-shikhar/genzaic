"use client"

import { useMutation } from "@tanstack/react-query"
import { postJSON } from "@/lib/react-query/fetcher"

export function useSignup() {
  return useMutation({
    mutationFn: (input: { name: string; email: string; password: string; role: string }) =>
      postJSON<typeof input, { message: string; email: string }>("/api/auth/signup", input),
  })
}

export function useVerifyOTP() {
  return useMutation({
    mutationFn: (input: { email: string; otp: string }) =>
      postJSON<typeof input, { success: boolean }>("/api/auth/verify-email", input),
  })
}

export function useResendOTP() {
  return useMutation({
    mutationFn: (input: { email: string }) =>
      postJSON<typeof input, { message: string }>("/api/auth/resend-otp", input),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: { email: string }) =>
      postJSON<typeof input, { message: string }>("/api/auth/forgot-password", input),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; password: string }) =>
      postJSON<typeof input, { message: string }>("/api/auth/reset-password", input),
  })
}
