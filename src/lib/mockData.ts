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
  productThumbnail?: string;
  productDescription?: string;
  buyerEmail: string;
  buyerName: string;
  buyerPhone?: string;
  buyerGstin?: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  status: 'completed' | 'pending' | 'refunded';
  paymentMethod?: string;
  downloadCount: number;
  maxDownloads: number;
  downloadLink: string;
  createdAt: string;
}

export interface DownloadLog {
  id: string;
  orderId: string;
  productTitle: string;
  buyerName: string;
  buyerEmail: string;
  downloadedAt: string;
  ipAddress?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  sellerName: string;
  sellerGstin?: string;
  buyerName: string;
  buyerEmail: string;
  buyerGstin?: string;
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
    productThumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    productDescription: 'A comprehensive collection of 100+ React components with TypeScript support.',
    buyerEmail: 'priya.patel@example.com',
    buyerName: 'Priya Patel',
    buyerPhone: '+91 98765 43210',
    amount: 1999,
    gstAmount: 360,
    totalAmount: 2359,
    status: 'completed',
    paymentMethod: 'UPI',
    downloadCount: 2,
    maxDownloads: 5,
    downloadLink: 'https://download.genzaic.com/abc123',
    createdAt: '2025-01-21T10:30:00Z',
  },
  {
    id: 'order-2',
    productId: 'prod-2',
    productTitle: 'Startup Business Plan Template',
    productThumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
    productDescription: 'Professional business plan template used by 500+ startups.',
    buyerEmail: 'amit.kumar@example.com',
    buyerName: 'Amit Kumar',
    buyerPhone: '+91 98765 12345',
    buyerGstin: '29ABCDE1234F1Z5',
    amount: 499,
    gstAmount: 90,
    totalAmount: 589,
    status: 'completed',
    paymentMethod: 'Card',
    downloadCount: 1,
    maxDownloads: 5,
    downloadLink: 'https://download.genzaic.com/def456',
    createdAt: '2025-01-20T14:45:00Z',
  },
  {
    id: 'order-3',
    productId: 'prod-1',
    productTitle: 'Ultimate React Component Library',
    productThumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    productDescription: 'A comprehensive collection of 100+ React components with TypeScript support.',
    buyerEmail: 'sneha.gupta@example.com',
    buyerName: 'Sneha Gupta',
    amount: 1999,
    gstAmount: 360,
    totalAmount: 2359,
    status: 'completed',
    paymentMethod: 'UPI',
    downloadCount: 3,
    maxDownloads: 5,
    downloadLink: 'https://download.genzaic.com/ghi789',
    createdAt: '2025-01-19T09:15:00Z',
  },
  {
    id: 'order-4',
    productId: 'prod-4',
    productTitle: 'Complete JavaScript Course',
    productThumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400',
    productDescription: 'Master JavaScript from basics to advanced concepts with 50+ hours of content.',
    buyerEmail: 'raj.malhotra@example.com',
    buyerName: 'Raj Malhotra',
    amount: 3999,
    gstAmount: 720,
    totalAmount: 4719,
    status: 'pending',
    paymentMethod: 'Net Banking',
    downloadCount: 0,
    maxDownloads: 5,
    downloadLink: 'https://download.genzaic.com/jkl012',
    createdAt: '2025-01-22T16:20:00Z',
  },
  {
    id: 'order-5',
    productId: 'prod-5',
    productTitle: 'Personal Finance eBook',
    productThumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    productDescription: 'Learn to manage your money effectively with practical tips and strategies.',
    buyerEmail: 'neha.sharma@example.com',
    buyerName: 'Neha Sharma',
    amount: 299,
    gstAmount: 54,
    totalAmount: 353,
    status: 'completed',
    paymentMethod: 'Wallet',
    downloadCount: 1,
    maxDownloads: 5,
    downloadLink: 'https://download.genzaic.com/mno345',
    createdAt: '2025-01-18T11:00:00Z',
  },
];

// Mock download logs
export const mockDownloadLogs: DownloadLog[] = [
  {
    id: 'dl-1',
    orderId: 'order-1',
    productTitle: 'Ultimate React Component Library',
    buyerName: 'Priya Patel',
    buyerEmail: 'priya.patel@example.com',
    downloadedAt: '2025-01-21T10:35:00Z',
    ipAddress: '103.25.xx.xx',
  },
  {
    id: 'dl-2',
    orderId: 'order-1',
    productTitle: 'Ultimate React Component Library',
    buyerName: 'Priya Patel',
    buyerEmail: 'priya.patel@example.com',
    downloadedAt: '2025-01-21T15:20:00Z',
    ipAddress: '103.25.xx.xx',
  },
  {
    id: 'dl-3',
    orderId: 'order-2',
    productTitle: 'Startup Business Plan Template',
    buyerName: 'Amit Kumar',
    buyerEmail: 'amit.kumar@example.com',
    downloadedAt: '2025-01-20T14:50:00Z',
    ipAddress: '49.36.xx.xx',
  },
  {
    id: 'dl-4',
    orderId: 'order-3',
    productTitle: 'Ultimate React Component Library',
    buyerName: 'Sneha Gupta',
    buyerEmail: 'sneha.gupta@example.com',
    downloadedAt: '2025-01-19T09:20:00Z',
    ipAddress: '122.161.xx.xx',
  },
  {
    id: 'dl-5',
    orderId: 'order-3',
    productTitle: 'Ultimate React Component Library',
    buyerName: 'Sneha Gupta',
    buyerEmail: 'sneha.gupta@example.com',
    downloadedAt: '2025-01-19T14:30:00Z',
    ipAddress: '122.161.xx.xx',
  },
  {
    id: 'dl-6',
    orderId: 'order-3',
    productTitle: 'Ultimate React Component Library',
    buyerName: 'Sneha Gupta',
    buyerEmail: 'sneha.gupta@example.com',
    downloadedAt: '2025-01-20T10:15:00Z',
    ipAddress: '122.161.xx.xx',
  },
  {
    id: 'dl-7',
    orderId: 'order-5',
    productTitle: 'Personal Finance eBook',
    buyerName: 'Neha Sharma',
    buyerEmail: 'neha.sharma@example.com',
    downloadedAt: '2025-01-18T11:05:00Z',
    ipAddress: '59.88.xx.xx',
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
    buyerEmail: 'priya.patel@example.com',
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
    buyerEmail: 'amit.kumar@example.com',
    buyerGstin: '29ABCDE1234F1Z5',
    productTitle: 'Startup Business Plan Template',
    amount: 499,
    gstAmount: 90,
    totalAmount: 589,
    createdAt: '2025-01-20',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'GENZAIC/2025/00003',
    orderId: 'order-3',
    sellerName: 'Rahul Sharma',
    sellerGstin: '29ABCDE1234F1Z5',
    buyerName: 'Sneha Gupta',
    buyerEmail: 'sneha.gupta@example.com',
    productTitle: 'Ultimate React Component Library',
    amount: 1999,
    gstAmount: 360,
    totalAmount: 2359,
    createdAt: '2025-01-19',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'GENZAIC/2025/00004',
    orderId: 'order-5',
    sellerName: 'Rahul Sharma',
    sellerGstin: '29ABCDE1234F1Z5',
    buyerName: 'Neha Sharma',
    buyerEmail: 'neha.sharma@example.com',
    productTitle: 'Personal Finance eBook',
    amount: 299,
    gstAmount: 54,
    totalAmount: 353,
    createdAt: '2025-01-18',
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
  totalSales: 10439,
  totalOrders: 5,
  totalProducts: 6,
  pendingPayout: 4719,
  completedPayout: 5660,
  monthlyRevenue: 10439,
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

// Helper to generate order ID
export const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Helper to get product by ID
export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(p => p.id === id);
};

// Helper to get order by ID
export const getOrderById = (id: string): Order | undefined => {
  return mockOrders.find(o => o.id === id);
};