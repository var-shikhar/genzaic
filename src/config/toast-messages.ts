/**
 * Centralized Toast Messages Configuration
 * 
 * This file contains all static toast messages used throughout the application.
 * These messages serve as fallbacks when backend doesn't provide a message.
 */

export const TOAST_MESSAGES = {
  // Authentication Messages
  auth: {
    loginSuccess: "Welcome back! You've been successfully logged in.",
    loginError: "Login failed. Please check your credentials and try again.",
    logoutSuccess: "You've been successfully logged out.",
    signupSuccess: "Account created successfully! Please verify your email.",
    signupError: "Failed to create account. Please try again.",
    verificationSuccess: "Email verified successfully! Welcome aboard.",
    verificationError: "Verification failed. Please check your code and try again.",
    verificationResent: "Verification code has been resent to your email.",
    passwordResetSent: "Password reset link has been sent to your email.",
    passwordResetError: "Failed to send password reset link. Please try again.",
    passwordResetSuccess: "Password has been reset successfully.",
    sessionExpired: "Your session has expired. Please log in again.",
    unauthorized: "You don't have permission to access this resource.",
  },

  // Product Messages
  product: {
    createSuccess: "Product created successfully!",
    createError: "Failed to create product. Please try again.",
    updateSuccess: "Product updated successfully!",
    updateError: "Failed to update product. Please try again.",
    deleteSuccess: "Product deleted successfully!",
    deleteError: "Failed to delete product. Please try again.",
    publishSuccess: "Product published successfully!",
    publishError: "Failed to publish product. Please try again.",
    unpublishSuccess: "Product unpublished successfully!",
    unpublishError: "Failed to unpublish product. Please try again.",
    uploadError: "Failed to upload file. Please try again.",
    extractionSuccess: "Product details extracted successfully!",
    extractionError: "Failed to extract product details. Please try again.",
    copySuccess: "Product link copied to clipboard!",
  },

  // Order/Purchase Messages
  order: {
    purchaseSuccess: "Purchase completed successfully!",
    purchaseError: "Purchase failed. Please try again.",
    downloadSuccess: "Download started successfully!",
    downloadError: "Failed to download file. Please try again.",
    refundSuccess: "Refund processed successfully!",
    refundError: "Failed to process refund. Please try again.",
  },

  // Storefront Messages
  storefront: {
    updateSuccess: "Storefront updated successfully!",
    updateError: "Failed to update storefront. Please try again.",
    urlCopied: "Storefront URL copied to clipboard!",
    customizationSaved: "Customization saved successfully!",
  },

  // Settings Messages
  settings: {
    updateSuccess: "Settings updated successfully!",
    updateError: "Failed to update settings. Please try again.",
    profileUpdateSuccess: "Profile updated successfully!",
    profileUpdateError: "Failed to update profile. Please try again.",
    passwordChangeSuccess: "Password changed successfully!",
    passwordChangeError: "Failed to change password. Please try again.",
    emailUpdateSuccess: "Email updated successfully! Please verify your new email.",
    emailUpdateError: "Failed to update email. Please try again.",
  },

  // KYC Messages
  kyc: {
    submitSuccess: "KYC details submitted successfully!",
    submitError: "Failed to submit KYC details. Please try again.",
    verificationPending: "Your KYC verification is pending.",
    verificationApproved: "Your KYC has been approved!",
    verificationRejected: "Your KYC has been rejected. Please resubmit.",
  },

  // Payout Messages
  payout: {
    requestSuccess: "Payout requested successfully!",
    requestError: "Failed to request payout. Please try again.",
    processingPending: "Your payout is being processed.",
    payoutCompleted: "Payout completed successfully!",
    payoutFailed: "Payout failed. Please contact support.",
  },

  // Delivery Messages
  delivery: {
    updateSuccess: "Delivery settings updated successfully!",
    updateError: "Failed to update delivery settings. Please try again.",
    deliveryCompleted: "Order delivered successfully!",
    deliveryFailed: "Failed to deliver order. Please try again.",
  },

  // File Upload Messages
  upload: {
    success: "File uploaded successfully!",
    error: "Failed to upload file. Please try again.",
    sizeExceeded: "File size exceeds the maximum limit.",
    invalidFormat: "Invalid file format. Please upload a supported file type.",
    uploadProgress: "Uploading file...",
  },

  // Validation Messages
  validation: {
    requiredField: "This field is required.",
    invalidEmail: "Please enter a valid email address.",
    invalidUrl: "Please enter a valid URL.",
    passwordMismatch: "Passwords do not match.",
    minLength: "Input is too short. Please enter more characters.",
    maxLength: "Input is too long. Please reduce the number of characters.",
    invalidFormat: "Invalid format. Please check your input.",
  },

  // Network Messages
  network: {
    offline: "You are currently offline. Please check your internet connection.",
    online: "You are back online!",
    serverError: "Server error occurred. Please try again later.",
    timeout: "Request timed out. Please try again.",
    connectionError: "Connection error. Please check your internet connection.",
  },

  // General Messages
  general: {
    success: "Operation completed successfully!",
    error: "An error occurred. Please try again.",
    warning: "Please review your input before proceeding.",
    info: "Information updated.",
    copied: "Copied to clipboard!",
    saved: "Changes saved successfully!",
    deleted: "Deleted successfully!",
    loading: "Loading...",
    processing: "Processing your request...",
    comingSoon: "This feature is coming soon!",
    notFound: "The requested resource was not found.",
    accessDenied: "Access denied. You don't have permission to perform this action.",
  },

  // Admin Messages
  admin: {
    userUpdated: "User updated successfully!",
    userDeleted: "User deleted successfully!",
    userActivated: "User activated successfully!",
    userDeactivated: "User deactivated successfully!",
    actionError: "Failed to perform action. Please try again.",
  },
} as const;

// Type for toast message paths
export type ToastMessagePath = 
  | `auth.${keyof typeof TOAST_MESSAGES.auth}`
  | `product.${keyof typeof TOAST_MESSAGES.product}`
  | `order.${keyof typeof TOAST_MESSAGES.order}`
  | `storefront.${keyof typeof TOAST_MESSAGES.storefront}`
  | `settings.${keyof typeof TOAST_MESSAGES.settings}`
  | `kyc.${keyof typeof TOAST_MESSAGES.kyc}`
  | `payout.${keyof typeof TOAST_MESSAGES.payout}`
  | `delivery.${keyof typeof TOAST_MESSAGES.delivery}`
  | `upload.${keyof typeof TOAST_MESSAGES.upload}`
  | `validation.${keyof typeof TOAST_MESSAGES.validation}`
  | `network.${keyof typeof TOAST_MESSAGES.network}`
  | `general.${keyof typeof TOAST_MESSAGES.general}`
  | `admin.${keyof typeof TOAST_MESSAGES.admin}`;

/**
 * Get a toast message by path
 * @param path - Dot-notation path to the message (e.g., 'auth.loginSuccess')
 * @returns The message string
 */
export function getToastMessage(path: ToastMessagePath): string {
  const [category, key] = path.split('.') as [keyof typeof TOAST_MESSAGES, string];
  return (TOAST_MESSAGES[category] as any)[key] || TOAST_MESSAGES.general.error;
}
