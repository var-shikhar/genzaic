import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Pages
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import DisclaimerPage from "./pages/DisclaimerPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import OnboardingPage from "./pages/onboarding/OnboardingPage";
import PlanSelectionPage from "./pages/onboarding/PlanSelectionPage";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ProductsPage from "./pages/dashboard/ProductsPage";
import AddProductPage from "./pages/dashboard/AddProductPage";
import StorefrontPage from "./pages/dashboard/StorefrontPage";
import SalesPage from "./pages/dashboard/SalesPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import DownloadPage from "./pages/checkout/DownloadPage";
import PayoutsPage from "./pages/dashboard/PayoutsPage";
import KYCPage from "./pages/dashboard/KYCPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import DeliveryPage from "./pages/dashboard/DeliveryPage";
import AdminPanel from "./pages/admin/AdminPanel";
import PublicStorefront from "./pages/store/PublicStorefront";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/disclaimer" element={<DisclaimerPage />} />
    <Route
      path="/login"
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      }
    />
    <Route
      path="/signup"
      element={
        <PublicRoute>
          <SignupPage />
        </PublicRoute>
      }
    />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/verify-email" element={<VerifyEmailPage />} />
    <Route
      path="/onboarding"
      element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/plan-selection"
      element={
        <ProtectedRoute>
          <PlanSelectionPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardHome />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/products"
      element={
        <ProtectedRoute>
          <ProductsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/products/new"
      element={
        <ProtectedRoute>
          <AddProductPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/storefront"
      element={
        <ProtectedRoute>
          <StorefrontPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/sales"
      element={
        <ProtectedRoute>
          <SalesPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/payouts"
      element={
        <ProtectedRoute>
          <PayoutsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/kyc"
      element={
        <ProtectedRoute>
          <KYCPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/settings"
      element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/delivery"
      element={
        <ProtectedRoute>
          <DeliveryPage />
        </ProtectedRoute>
      }
    />
    <Route path="/admin" element={<AdminPanel />} />
    <Route path="/store/:storeUrl" element={<PublicStorefront />} />
    <Route path="/checkout/:productId" element={<CheckoutPage />} />
    <Route path="/download/:orderId" element={<DownloadPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
