import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface AuthUser {
  id: string
  email: string
  name: string
  image?: string | null
  role: "buyer" | "seller" | "admin"
  isSeller: boolean
  storeUrl?: string | null
  planType: "creator" | "startup" | "enterprise"
  kycStatus: "not_submitted" | "pending" | "verified" | "rejected"
  onboardingComplete: boolean
}

interface AuthState {
  user: AuthUser | null
  pendingVerificationEmail: string | null
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  pendingVerificationEmail: null,
  isLoading: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
    },
    updateUser(state, action: PayloadAction<Partial<AuthUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    setPendingVerificationEmail(state, action: PayloadAction<string | null>) {
      state.pendingVerificationEmail = action.payload
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    clearAuth(state) {
      state.user = null
      state.pendingVerificationEmail = null
    },
  },
})

export const { setUser, updateUser, setPendingVerificationEmail, setLoading, clearAuth } = authSlice.actions
export default authSlice.reducer
