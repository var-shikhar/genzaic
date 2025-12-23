import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, mockCurrentUser, StorefrontSettings, BuyerOrder, mockBuyerOrders } from '@/lib/mockData';

export type UserRole = 'buyer' | 'seller';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateStorefrontSettings: (settings: Partial<StorefrontSettings>) => void;
  verifyOTP: (otp: string) => Promise<boolean>;
  becomeSeller: () => void;
  buyerOrders: BuyerOrder[];
  addBuyerOrder: (order: BuyerOrder) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [buyerOrders, setBuyerOrders] = useState<BuyerOrder[]>([]);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('genzaic_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    // Load buyer orders
    const storedOrders = localStorage.getItem('genzaic_buyer_orders');
    if (storedOrders) {
      setBuyerOrders(JSON.parse(storedOrders));
    } else {
      setBuyerOrders(mockBuyerOrders);
      localStorage.setItem('genzaic_buyer_orders', JSON.stringify(mockBuyerOrders));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in production, this would hit an API
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    if (email && password) {
      const loggedInUser = { ...mockCurrentUser, email };
      setUser(loggedInUser);
      localStorage.setItem('genzaic_user', JSON.stringify(loggedInUser));
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const signup = async (name: string, email: string, password: string, role: UserRole = 'seller'): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (name && email && password) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        storeUrl: name.toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date().toISOString(),
        kycStatus: 'not_submitted',
        planType: 'creator',
        onboardingComplete: role === 'buyer', // Buyers don't need onboarding
        followers: 0,
        rating: 0,
        role,
        isSeller: role === 'seller',
        storefrontSettings: role === 'seller' ? {
          themeId: 'modern',
          primaryColor: '#073f7c',
          fontFamily: 'Inter',
          tagline: `Digital products by ${name}`,
          isPublished: false,
        } : undefined,
      };
      setUser(newUser);
      localStorage.setItem('genzaic_user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const becomeSeller = () => {
    if (user) {
      const updatedUser = {
        ...user,
        role: 'seller' as UserRole,
        isSeller: true,
        onboardingComplete: false,
        storefrontSettings: {
          themeId: 'modern',
          primaryColor: '#073f7c',
          fontFamily: 'Inter',
          tagline: `Digital products by ${user.name}`,
          isPublished: false,
        },
      };
      setUser(updatedUser);
      localStorage.setItem('genzaic_user', JSON.stringify(updatedUser));
    }
  };

  const addBuyerOrder = (order: BuyerOrder) => {
    const updatedOrders = [order, ...buyerOrders];
    setBuyerOrders(updatedOrders);
    localStorage.setItem('genzaic_buyer_orders', JSON.stringify(updatedOrders));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('genzaic_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('genzaic_user', JSON.stringify(updatedUser));
    }
  };

  const updateStorefrontSettings = (settings: Partial<StorefrontSettings>) => {
    if (user) {
      const updatedSettings = { ...user.storefrontSettings, ...settings } as StorefrontSettings;
      const updatedUser = { ...user, storefrontSettings: updatedSettings };
      setUser(updatedUser);
      localStorage.setItem('genzaic_user', JSON.stringify(updatedUser));
    }
  };

  const verifyOTP = async (otp: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock OTP verification - accept any 6-digit code
    return otp.length === 6;
  };

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
