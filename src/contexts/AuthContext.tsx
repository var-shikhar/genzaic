import { toast } from "@/lib/toast"
import { authAPI } from "@/lib/api/auth"
import { buyerAPI, type BuyerOrder as ApiBuyerOrder } from "@/lib/api/buyer"
import {
  BuyerOrder,
  mockBuyerOrders,
  StorefrontSettings,
  User,
} from "@/lib/mockData"
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

export type UserRole = "buyer" | "seller"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (
    name: string,
    email: string,
    password: string,
    role?: UserRole
  ) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
  updateStorefrontSettings: (settings: Partial<StorefrontSettings>) => void
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>
  becomeSeller: () => void
  buyerOrders: BuyerOrder[]
  addBuyerOrder: (order: BuyerOrder) => void
  pendingVerificationEmail: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [buyerOrders, setBuyerOrders] = useState<BuyerOrder[]>([])
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<
    string | null
  >(null)

  // Function to fetch buyer orders from backend
  const fetchBuyerOrders = async () => {
    try {
      const response = await buyerAPI.getOrders()
      setBuyerOrders(response.orders as any) // Type conversion for compatibility
    } catch (error) {
      console.error("Failed to fetch buyer orders:", error)
      // Fallback to empty array
      setBuyerOrders([])
    }
  }

  useEffect(() => {
    // Restore session from httpOnly cookies on mount
    const initializeAuth = async () => {
      try {
        const response = await authAPI.getCurrentUser()
        if (response.success && response.data) {
          setUser(response.data.user)
          // Fetch buyer orders if user is logged in
          await fetchBuyerOrders()
        }
      } catch (error) {
        // No active session - user not logged in
        console.log("No active session")
      } finally {
        setIsLoading(false)
      }
    }

    // Listen for unauthorized events (401 errors) and auto-logout
    const handleUnauthorized = () => {
      if (user) {
        setUser(null)
        setBuyerOrders([])
        setPendingVerificationEmail(null)
        toast.error("Session Expired", "auth.loginError")
      }
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized)
    initializeAuth()

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized)
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true)
      const response = await authAPI.login({ email, password })

      if (response.success && response.data) {
        setUser(response.data.user)
        // Fetch buyer orders after successful login
        await fetchBuyerOrders()
        return { success: true, message: response.message }
      }

      return { success: false, message: response.message }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole = "seller"
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true)
      const response = await authAPI.signup({ name, email, password, role })

      if (response.success) {
        setPendingVerificationEmail(email)
        return { success: true, message: response.message }
      }
      return { success: false, message: response.message }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : undefined
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const becomeSeller = () => {
    if (user) {
      const updatedUser = {
        ...user,
        role: "seller" as UserRole,
        isSeller: true,
        onboardingComplete: false,
        storefrontSettings: {
          themeId: "modern",
          primaryColor: "#073f7c",
          fontFamily: "Inter",
          tagline: `Digital products by ${user.name}`,
          isPublished: false,
        },
      }
      setUser(updatedUser)
      localStorage.setItem("genzaic_user", JSON.stringify(updatedUser))
    }
  }

  const addBuyerOrder = async (order: BuyerOrder) => {
    // Optimistically add to state
    const updatedOrders = [order, ...buyerOrders]
    setBuyerOrders(updatedOrders)

    // Refresh from backend to ensure consistency
    // The backend will have created this order through the checkout flow
    await fetchBuyerOrders()
  }

  const logout = async () => {
    try {
      await authAPI.logout()
      setUser(null)
      setBuyerOrders([]) // Clear buyer orders on logout
      setPendingVerificationEmail(null)
      toast.success(undefined, "auth.logoutSuccess")
    } catch (error) {
      // Clear local state even if API call fails
      setUser(null)
      setBuyerOrders([])
      setPendingVerificationEmail(null)
      console.error("Logout error:", error)
    }
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("genzaic_user", JSON.stringify(updatedUser))
    }
  }

  const updateStorefrontSettings = (settings: Partial<StorefrontSettings>) => {
    if (user) {
      const updatedSettings = {
        ...user.storefrontSettings,
        ...settings,
      } as StorefrontSettings
      const updatedUser = { ...user, storefrontSettings: updatedSettings }
      setUser(updatedUser)
      localStorage.setItem("genzaic_user", JSON.stringify(updatedUser))
    }
  }

  const verifyOTP = async (email: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true)
      const response = await authAPI.verifyEmail({ email, otp })

      if (response.success && response.data) {
        setUser(response.data.user)
        setPendingVerificationEmail(null)
        return { success: true, message: response.message }
      }

      return { success: false, message: response.message }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : undefined
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        updateStorefrontSettings,
        verifyOTP,
        becomeSeller,
        buyerOrders,
        addBuyerOrder,
        pendingVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
