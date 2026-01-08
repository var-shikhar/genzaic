/**
 * Upload Middleware
 * Handles file uploads using Multer
 */

import multer from "multer"
import { Request } from "express"
import { ValidationError } from "@/utils/errors"

// Configure multer to use memory storage (files stored in buffer)
const storage = multer.memoryStorage()

// File filter for images
const imageFileFilter = (
  _: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ]

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new ValidationError(
        "Invalid file type. Only images are allowed (JPG, PNG, GIF, WebP, SVG)"
      )
    )
  }
}

// File filter for product files
const productFileFilter = (
  _: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/x-tar",
    "application/gzip",
  ]

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new ValidationError(
        "Invalid file type. Only PDF, ZIP, RAR, 7Z files are allowed"
      )
    )
  }
}

// File filter for any allowed type (images + products)
const anyAllowedFileFilter = (
  _: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Documents/Archives
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/x-tar",
    "application/gzip",
  ]

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new ValidationError(
        "Invalid file type. Only images, PDF, ZIP, RAR, 7Z files are allowed"
      )
    )
  }
}

// Maximum file sizes
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_PRODUCT_FILE_SIZE = 100 * 1024 * 1024 // 100MB

/**
 * Middleware for uploading product files (images + product file)
 */
export const uploadProductFiles = multer({
  storage,
  fileFilter: anyAllowedFileFilter,
  limits: {
    fileSize: MAX_PRODUCT_FILE_SIZE, // Max size for product files
  },
}).fields([
  { name: "productFile", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
])

/**
 * Middleware for uploading storefront images (cover + profile/logo)
 */
export const uploadStorefrontImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).fields([
  { name: "coverImage", maxCount: 1 },
  { name: "profileImage", maxCount: 1 },
])

/**
 * Middleware for uploading a single image
 */
export const uploadSingleImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).single("image")

/**
 * Middleware for uploading a single product file
 */
export const uploadSingleProductFile = multer({
  storage,
  fileFilter: productFileFilter,
  limits: {
    fileSize: MAX_PRODUCT_FILE_SIZE,
  },
}).single("file")

/**
 * Middleware for uploading profile/avatar image
 */
export const uploadProfileImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).single("profileImage")

/**
 * Middleware for uploading cover image
 */
export const uploadCoverImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).single("coverImage")
