// GenZaic Mock Data Store

export interface StorefrontSettings {
  profileImage?: string;
  coverImage?: string;
  tagline?: string;
  themeId: string;
  primaryColor: string;
  fontFamily: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
  isPublished?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  storeUrl: string;
  createdAt: string;
  kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  planType: 'creator' | 'startup';
  onboardingComplete: boolean;
  storefrontSettings?: StorefrontSettings;
  followers?: number;
  rating?: number;
}

export type ProductCategory = 'ebook' | 'template' | 'app' | 'course' | 'graphics' | 'audio' | 'other';

export interface Product {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  fileUrl?: string;
  thumbnailUrl?: string;
  seoTitle?: string;
  seoKeywords?: string;
  status: 'draft' | 'published';
  downloads: number;
  createdAt: string;
  category?: ProductCategory;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  hasDiscount?: boolean;
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  buyerEmail: string;
  buyerName: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  status: 'completed' | 'pending' | 'refunded';
  downloadCount: number;
  maxDownloads: number;
  downloadLink: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  sellerName: string;
  sellerGstin?: string;
  buyerName: string;
  buyerEmail: string;
  productTitle: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  createdAt: string;
}

export interface Payout {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed';
  bankAccount: string;
  createdAt: string;
  completedAt?: string;
}

export interface KYCData {
  panNumber: string;
  panFile?: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  pennyDropStatus: 'pending' | 'success' | 'failed';
}

export interface StorefrontTheme {
  id: string;
  name: string;
  thumbnail: string;
  primaryColor: string;
  description: string;
}

// Mock Storefront Themes
export const storefrontThemes: StorefrontTheme[] = [
  {
    id: 'minimal',
    name: 'Minimal White',
    thumbnail: '/themes/minimal.png',
    primaryColor: '#073f7c',
    description: 'Clean and minimal design with focus on products',
  },
  {
    id: 'modern',
    name: 'Modern Blue',
    thumbnail: '/themes/modern.png',
    primaryColor: '#1863a1',
    description: 'Contemporary design with bold blue accents',
  },
  {
    id: 'elegant',
    name: 'Elegant Dark',
    thumbnail: '/themes/elegant.png',
    primaryColor: '#2d3748',
    description: 'Sophisticated dark theme for premium products',
  },
  {
    id: 'vibrant',
    name: 'Vibrant Gradient',
    thumbnail: '/themes/vibrant.png',
    primaryColor: '#667eea',
    description: 'Eye-catching gradients for creative sellers',
  },
  {
    id: 'classic',
    name: 'Classic Professional',
    thumbnail: '/themes/classic.png',
    primaryColor: '#1a365d',
    description: 'Traditional professional layout',
  },
];

// Mock current user
export const mockCurrentUser: User = {
  id: 'user-1',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  storeUrl: 'rahul-store',
  createdAt: '2025-01-15',
  kycStatus: 'not_submitted',
  planType: 'creator',
  onboardingComplete: true,
  followers: 125,
  rating: 4.8,
  storefrontSettings: {
    themeId: 'modern',
    primaryColor: '#073f7c',
    fontFamily: 'Inter',
    tagline: 'Digital products by Rahul Sharma',
    isPublished: true,
  },
};

// Mock products with categories
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    userId: 'user-1',
    title: 'Ultimate React Component Library',
    description: 'A comprehensive collection of 100+ React components with TypeScript support.',
    price: 1999,
    originalPrice: 2999,
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    status: 'published',
    downloads: 145,
    createdAt: '2025-01-20',
    category: 'template',
    rating: 4.9,
    reviewCount: 45,
    isFeatured: true,
    hasDiscount: true,
  },
  {
    id: 'prod-2',
    userId: 'user-1',
    title: 'Startup Business Plan Template',
    description: 'Professional business plan template used by 500+ startups.',
    price: 499,
    thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
    status: 'published',
    downloads: 89,
    createdAt: '2025-01-18',
    category: 'template',
    rating: 4.7,
    reviewCount: 32,
  },
  {
    id: 'prod-3',
    userId: 'user-1',
    title: 'E-commerce UI Kit',
    description: 'Complete Figma UI kit for e-commerce applications.',
    price: 2499,
    thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
    status: 'draft',
    downloads: 0,
    createdAt: '2025-01-22',
    category: 'graphics',
    rating: 0,
    reviewCount: 0,
  },
  {
    id: 'prod-4',
    userId: 'user-1',
    title: 'Complete JavaScript Course',
    description: 'Master JavaScript from basics to advanced concepts with 50+ hours of content.',
    price: 3999,
    originalPrice: 5999,
    thumbnailUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400',
    status: 'published',
    downloads: 234,
    createdAt: '2025-01-10',
    category: 'course',
    rating: 4.8,
    reviewCount: 78,
    isFeatured: true,
    hasDiscount: true,
  },
  {
    id: 'prod-5',
    userId: 'user-1',
    title: 'Personal Finance eBook',
    description: 'Learn to manage your money effectively with practical tips and strategies.',
    price: 299,
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    status: 'published',
    downloads: 156,
    createdAt: '2025-01-05',
    category: 'ebook',
    rating: 4.5,
    reviewCount: 23,
  },
  {
    id: 'prod-6',
    userId: 'user-1',
    title: 'Mobile App UI Kit',
    description: 'Beautiful mobile app UI kit with 200+ screens for iOS and Android.',
    price: 1499,
    thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
    status: 'published',
    downloads: 67,
    createdAt: '2025-01-12',
    category: 'app',
    rating: 4.6,
    reviewCount: 19,
  },
];

// Mock orders
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    productId: 'prod-1',
    productTitle: 'Ultimate React Component Library',
    buyerEmail: 'buyer1@example.com',
    buyerName: 'Priya Patel',
    amount: 1999,
    gstAmount: 360,
    totalAmount: 2359,
    status: 'completed',
    downloadCount: 2,
    maxDownloads: 5,
    downloadLink: 'https://download.genzaic.com/abc123',
    createdAt: '2025-01-21',
  },
  {
    id: 'order-2',
    productId: 'prod-2',
    productTitle: 'Startup Business Plan Template',
    buyerEmail: 'buyer2@example.com',
    buyerName: 'Amit Kumar',
    amount: 499,
    gstAmount: 90,
    totalAmount: 589,
    status: 'completed',
    downloadCount: 1,
    maxDownloads: 5,
    downloadLink: 'https://download.genzaic.com/def456',
    createdAt: '2025-01-20',
  },
  {
    id: 'order-3',
    productId: 'prod-1',
    productTitle: 'Ultimate React Component Library',
    buyerEmail: 'buyer3@example.com',
    buyerName: 'Sneha Gupta',
    amount: 1999,
    gstAmount: 360,
    totalAmount: 2359,
    status: 'completed',
    downloadCount: 3,
    maxDownloads: 5,
    downloadLink: 'https://download.genzaic.com/ghi789',
    createdAt: '2025-01-19',
  },
];

// Mock invoices
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'GENZAIC/2025/00001',
    orderId: 'order-1',
    sellerName: 'Rahul Sharma',
    sellerGstin: '29ABCDE1234F1Z5',
    buyerName: 'Priya Patel',
    buyerEmail: 'buyer1@example.com',
    productTitle: 'Ultimate React Component Library',
    amount: 1999,
    gstAmount: 360,
    totalAmount: 2359,
    createdAt: '2025-01-21',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'GENZAIC/2025/00002',
    orderId: 'order-2',
    sellerName: 'Rahul Sharma',
    sellerGstin: '29ABCDE1234F1Z5',
    buyerName: 'Amit Kumar',
    buyerEmail: 'buyer2@example.com',
    productTitle: 'Startup Business Plan Template',
    amount: 499,
    gstAmount: 90,
    totalAmount: 589,
    createdAt: '2025-01-20',
  },
];

// Mock payouts
export const mockPayouts: Payout[] = [
  {
    id: 'payout-1',
    amount: 4500,
    status: 'completed',
    bankAccount: 'HDFC ****1234',
    createdAt: '2025-01-15',
    completedAt: '2025-01-16',
  },
  {
    id: 'payout-2',
    amount: 2359,
    status: 'processing',
    bankAccount: 'HDFC ****1234',
    createdAt: '2025-01-22',
  },
  {
    id: 'payout-3',
    amount: 589,
    status: 'pending',
    bankAccount: 'HDFC ****1234',
    createdAt: '2025-01-23',
  },
];

// Mock KYC data
export const mockKYCData: KYCData = {
  panNumber: 'ABCDE1234F',
  accountHolderName: 'Rahul Sharma',
  accountNumber: '1234567890',
  ifscCode: 'HDFC0001234',
  verificationStatus: 'verified',
  pennyDropStatus: 'success',
};

// Dashboard stats
export const dashboardStats = {
  totalSales: 7307,
  totalOrders: 3,
  totalProducts: 3,
  pendingPayout: 2948,
  completedPayout: 4500,
};

// Mock sellers for admin
export const mockSellers: User[] = [
  mockCurrentUser,
  {
    id: 'user-2',
    name: 'Priya Mehta',
    email: 'priya@example.com',
    storeUrl: 'priya-designs',
    createdAt: '2025-01-10',
    kycStatus: 'pending',
    planType: 'creator',
    onboardingComplete: true,
  },
  {
    id: 'user-3',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    storeUrl: 'vikram-templates',
    createdAt: '2025-01-08',
    kycStatus: 'verified',
    planType: 'creator',
    onboardingComplete: true,
  },
  {
    id: 'user-4',
    name: 'Ananya Reddy',
    email: 'ananya@example.com',
    storeUrl: 'ananya-store',
    createdAt: '2025-01-05',
    kycStatus: 'rejected',
    planType: 'creator',
    onboardingComplete: false,
  },
];

// Helper to format currency in INR
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to generate invoice number
export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const count = mockInvoices.length + 1;
  return `GENZAIC/${year}/${count.toString().padStart(5, '0')}`;
};
