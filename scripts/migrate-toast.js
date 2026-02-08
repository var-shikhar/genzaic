#!/usr/bin/env node
/**
 * Toast Migration Script
 * 
 * This script helps migrate from Sonner toast to shadcn/ui toast
 * Run this to see all the replacements needed
 */

const files = [
    // Store pages
    'src/pages/store/ProductDetailPage.tsx',

    // Onboarding pages
    'src/pages/onboarding/OnboardingPage.tsx',
    'src/pages/onboarding/PlanSelectionPage.tsx',

    // Dashboard pages
    'src/pages/dashboard/StorefrontPage.tsx',
    'src/pages/dashboard/SettingsPage.tsx',
    'src/pages/dashboard/SalesPage.tsx',
    'src/pages/dashboard/ProductsPage.tsx',
    'src/pages/dashboard/NewProductPage.tsx',
    'src/pages/dashboard/EditProductPage.tsx',
    'src/pages/dashboard/DashboardHome.tsx',

    // Checkout pages
    'src/pages/checkout/DownloadPage.tsx',
    'src/pages/checkout/CheckoutPage.tsx',

    // Buyer pages
    'src/pages/buyer/PurchaseDetails.tsx',
    'src/pages/buyer/BuyerSettings.tsx',
    'src/pages/buyer/BuyerDashboard.tsx',

    // Components
    'src/components/dashboard/ProductForm.tsx',
];

console.log('Files to migrate:');
files.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
});

console.log(`\nTotal: ${files.length} files`);

console.log('\n=== Migration Pattern ===\n');
console.log('Replace imports:');
console.log('  FROM: import { toast } from "sonner"');
console.log('  TO:   import { showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from "@/lib/toast"');

console.log('\nReplace usage:');
console.log('  toast.success("message") → showSuccessToast("message", "general.success")');
console.log('  toast.error("message")   → showErrorToast("message", "general.error")');
console.log('  toast.warning("message") → showWarningToast("message", "general.warning")');
console.log('  toast.info("message")    → showInfoToast("message", "general.info")');
console.log('  toast.loading("message") → Use toast directly for loading states');
