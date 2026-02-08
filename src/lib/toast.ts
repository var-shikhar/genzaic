/**
 * Toast Utility
 * 
 * Centralized toast notification system with support for:
 * - Success, Error, Warning, and Info variants
 * - Fallback messages when backend doesn't provide one
 * - Consistent styling and behavior across the app
 * 
 * Usage:
 * import { toast } from "@/lib/toast";
 * 
 * toast.success("Operation successful!");
 * toast.error(backendError, "product.createError");
 * toast.warning("Please review your input");
 * toast.info("Information updated");
 */

import { toast as shadcnToast } from "@/hooks/use-toast";
import { getToastMessage, type ToastMessagePath } from "@/config/toast-messages";

export type ToastVariant = "success" | "error" | "warning" | "info" | "default";

interface ToastOptions {
  /**
   * The message to display. If not provided, uses the fallback message.
   */
  message?: string;
  
  /**
   * Fallback message path from toast-messages.ts
   * Used when message is not provided or when backend doesn't return a message
   */
  fallback?: ToastMessagePath;
  
  /**
   * Toast variant/type
   */
  variant?: ToastVariant;
  
  /**
   * Toast title (optional)
   */
  title?: string;
  
  /**
   * Duration in milliseconds (default: 5000)
   */
  duration?: number;
}

/**
 * Get variant-specific configuration
 */
function getVariantConfig(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return {
        title: "Success",
        variant: "success" as const,
      };
    case "error":
      return {
        title: "Error",
        variant: "destructive" as const,
      };
    case "warning":
      return {
        title: "Warning",
        variant: "warning" as const,
      };
    case "info":
      return {
        title: "Info",
        variant: "info" as const,
      };
    default:
      return {
        title: undefined,
        variant: "default" as const,
      };
  }
}

/**
 * Internal function to show a toast notification
 */
function showToast(options: ToastOptions) {
  const {
    message,
    fallback,
    variant = "default",
    title,
    duration = 5000,
  } = options;

  // Get the message to display (prefer provided message, fallback to configured message)
  const displayMessage = message || (fallback ? getToastMessage(fallback) : undefined);

  if (!displayMessage) {
    console.warn("Toast called without message or fallback");
    return;
  }

  const variantConfig = getVariantConfig(variant);

  shadcnToast({
    title: title || variantConfig.title,
    description: displayMessage,
    duration,
    variant: variantConfig.variant,
  });
}

/**
 * Toast API with method chaining
 */
export const toast = {
  /**
   * Show a success toast
   * @param message - Message to display (optional if fallback provided)
   * @param fallback - Fallback message path (optional)
   * 
   * @example
   * toast.success("Product created!");
   * toast.success(backendMessage, "product.createSuccess");
   * toast.success(undefined, "product.createSuccess"); // Uses fallback only
   */
  success: (message?: string, fallback?: ToastMessagePath) => {
    showToast({
      message,
      fallback: fallback || "general.success",
      variant: "success",
    });
  },

  /**
   * Show an error toast
   * @param message - Message to display (optional if fallback provided)
   * @param fallback - Fallback message path (optional)
   * 
   * @example
   * toast.error("Failed to save");
   * toast.error(backendError, "product.createError");
   * toast.error(undefined, "product.createError"); // Uses fallback only
   */
  error: (message?: string, fallback?: ToastMessagePath) => {
    showToast({
      message,
      fallback: fallback || "general.error",
      variant: "error",
    });
  },

  /**
   * Show a warning toast
   * @param message - Message to display (optional if fallback provided)
   * @param fallback - Fallback message path (optional)
   * 
   * @example
   * toast.warning("Please review your input");
   * toast.warning(undefined, "general.warning");
   */
  warning: (message?: string, fallback?: ToastMessagePath) => {
    showToast({
      message,
      fallback: fallback || "general.warning",
      variant: "warning",
    });
  },

  /**
   * Show an info toast
   * @param message - Message to display (optional if fallback provided)
   * @param fallback - Fallback message path (optional)
   * 
   * @example
   * toast.info("Information updated");
   * toast.info(undefined, "general.info");
   */
  info: (message?: string, fallback?: ToastMessagePath) => {
    showToast({
      message,
      fallback: fallback || "general.info",
      variant: "info",
    });
  },

  /**
   * Show a loading toast (no auto-dismiss)
   * @param message - Loading message
   * 
   * @example
   * toast.loading("Processing your request...");
   */
  loading: (message: string) => {
    shadcnToast({
      description: message,
      duration: Infinity, // Don't auto-dismiss
    });
  },

  /**
   * Show a toast for copy to clipboard action
   * @param message - Custom message (optional)
   * 
   * @example
   * toast.copy();
   * toast.copy("Link copied!");
   */
  copy: (message?: string) => {
    showToast({
      message: message || "Copied to clipboard!",
      fallback: "general.copied",
      variant: "success",
    });
  },
};

/**
 * Handle API response and show appropriate toast
 * Useful for handling backend responses with error/success messages
 * 
 * @example
 * const success = handleApiResponse(response, "product.createSuccess", "product.createError");
 */
export function handleApiResponse(
  response: { message?: string; error?: string },
  successFallback?: ToastMessagePath,
  errorFallback?: ToastMessagePath
): boolean {
  if (response.error) {
    toast.error(response.error, errorFallback);
    return false;
  }
  
  if (response.message) {
    toast.success(response.message, successFallback);
    return true;
  }
  
  // If no message or error, show success with fallback
  if (successFallback) {
    toast.success(undefined, successFallback);
    return true;
  }
  
  return true;
}
