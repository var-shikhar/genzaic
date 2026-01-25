import { prisma } from "@/config/database"
import { ConflictError, NotFoundError, ValidationError } from "@/utils/errors"
import { UploadService } from "@/services/upload.service"
import { logger } from "@/utils/logger"
import type {
  CreateProductDto,
  UpdateStorefrontDto,
  UpdatePaymentInfoDto,
  SelectPlanDto,
} from "@/validators/onboarding.validators"

export class OnboardingService {
  /**
   * Step 1: Create first product during onboarding
   */
  static async createFirstProduct(
    userId: string,
    productData: CreateProductDto,
    files?: {
      productFile?: Express.Multer.File
      thumbnail?: Express.Multer.File
    }
  ) {
    // Verify user has a storefront
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { storefront: true },
    })

    if (!user) {
      throw new NotFoundError("User not found")
    }

    if (user.role !== "seller") {
      throw new ValidationError("Only sellers can create products")
    }

    if (!user.storefront) {
      throw new NotFoundError("Storefront not found. Please contact support.")
    }

    // Create product first
    const product = await prisma.product.create({
      data: {
        storefrontId: user.storefront.id,
        title: productData.title || "",
        description: productData.description || "",
        price: productData.price,
        fileUrl: "",
        thumbnailUrl: null,
        seoTitle: productData.seoTitle || productData.title,
        seoKeywords: productData.seoKeywords || "",
        isActive: true,
        stock: null, // Digital products have unlimited stock
      },
    })

    // Upload files to Cloudinary/Drive
    let fileUrl = ""
    let thumbnailUrl: string | null = null
    let driveFileId: string | null = null
    let driveFileName: string | null = null

    try {
      // Upload product file (required)
      if (files?.productFile) {
        const productFileResult = await UploadService.uploadProductFile(
          files.productFile,
          userId,
          product.id
        )
        // Check if the result has secureUrl (old implementation) or fields for Drive
        // Based on DriveService it returns fileId, fileName, fileSize
        // But UploadService wrapper might return something different? 
        // Assuming UploadService delegates to DriveService for product files as per ProductService
        // Let's check ProductService usage: 
        // productFileResult.publicId is used as driveFileId.
        
        driveFileId = productFileResult.publicId
        driveFileName = files.productFile.originalname
        fileUrl = driveFileId || ""
        logger.info(`Product file uploaded: ${driveFileId}`)
      }

      // Upload thumbnail (optional)
      if (files?.thumbnail) {
        const thumbnailResult = await UploadService.uploadProductThumbnail(
          files.thumbnail
        )
        thumbnailUrl = thumbnailResult.secureUrl
        logger.info(`Thumbnail uploaded: ${thumbnailResult.publicId}`)
      }

      // Update product with file info
      if (driveFileId || thumbnailUrl) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            driveFileId,
            driveFileName,
            fileUrl,
            thumbnailUrl,
          },
        })
      }
    } catch (error) {
      // Cleanup if upload fails
      await prisma.product.delete({ where: { id: product.id } }).catch(() => {})
      logger.error("File upload failed:", error)
      throw new ValidationError("Failed to upload files. Please try again.")
    }

    return {
      product,
      message: "Product created successfully",
    }
  }

  /**
   * Step 2: Update storefront settings
   */
  static async updateStorefrontSettings(
    userId: string,
    settings: UpdateStorefrontDto,
    files?: {
      coverImage?: Express.Multer.File
      profileImage?: Express.Multer.File
    }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { storefront: true },
    })

    if (!user || !user.storefront) {
      throw new NotFoundError("Storefront not found")
    }

    // Upload images to Cloudinary if provided
    let coverImageUrl: string | undefined
    let profileImageUrl: string | undefined

    try {
      if (files?.coverImage) {
        const coverResult = await UploadService.uploadCoverImage(
          files.coverImage
        )
        coverImageUrl = coverResult.secureUrl
        logger.info(`Cover image uploaded: ${coverResult.publicId}`)
      }

      if (files?.profileImage) {
        const profileResult = await UploadService.uploadProfileImage(
          files.profileImage
        )
        profileImageUrl = profileResult.secureUrl
        logger.info(`Profile image uploaded: ${profileResult.publicId}`)
      }
    } catch (error) {
      logger.error("Image upload failed:", error)
      throw new ValidationError("Failed to upload images. Please try again.")
    }

    const updatedStorefront = await prisma.storefront.update({
      where: { id: user.storefront.id },
      data: {
        storeName: settings.storeName,
        description: settings.storeDescription,
        tagline: settings.tagline,
        themeId: settings.themeId,
        primaryColor: settings.primaryColor,
        fontFamily: settings.fontFamily,
        isPublished: settings.isPublished,
        ...(coverImageUrl && { coverImageUrl }),
        ...(profileImageUrl && { profileImageUrl }),
      },
    })

    return {
      storefront: updatedStorefront,
      message: "Storefront settings updated successfully",
    }
  }

  /**
   * Step 3: Update payment information
   * Now saves bank details to KYC table and UPI to storefront
   */
  static async updatePaymentInfo(
    userId: string,
    paymentInfo: UpdatePaymentInfoDto
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { storefront: true, kyc: true },
    })

    if (!user || !user.storefront) {
      throw new NotFoundError("Storefront not found")
    }

    // Handle bank payment method - store in KYC table
    if (paymentInfo.paymentMethod === "bank") {
      // Prepare KYC data
      const kycData: any = {
        documentType: paymentInfo.documentType!,
        accountHolderName: paymentInfo.accountHolderName!,
        accountNumber: paymentInfo.accountNumber!,
        ifscCode: paymentInfo.ifscCode!,
        bankName: paymentInfo.bankName!,
        verificationStatus: "pending",
        pennyDropStatus: "pending",
      }

      // Set document number based on type
      if (paymentInfo.documentType === "pan") {
        kycData.panNumber = paymentInfo.panNumber
        kycData.aadhaarNumber = null
      } else {
        kycData.aadhaarNumber = paymentInfo.aadhaarNumber?.replace(/\s/g, "")
        kycData.panNumber = null
      }

      // Create or update KYC record
      await prisma.kyc.upsert({
        where: { userId },
        create: { userId, ...kycData },
        update: kycData,
      })

      // Update user's KYC status
      await prisma.user.update({
        where: { id: userId },
        data: { kycStatus: "pending" },
      })

      // Update storefront with payment method only
      await prisma.storefront.update({
        where: { id: user.storefront.id },
        data: {
          paymentMethod: paymentInfo.paymentMethod,
        },
      })
    }

    // Handle UPI payment method - store in storefront
    if (paymentInfo.paymentMethod === "upi") {
      await prisma.storefront.update({
        where: { id: user.storefront.id },
        data: {
          paymentMethod: paymentInfo.paymentMethod,
          upiId: paymentInfo.upiId,
        },
      })
    }

    return {
      message: "Payment information saved successfully",
    }
  }

  /**
   * Step 4: Select plan
   */
  static async selectPlan(userId: string, planData: SelectPlanDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { storefront: true },
    })

    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Validate plan availability
    if (planData.planType === "startup") {
      throw new ValidationError("Startup plan is not available yet")
    }

    // Update user's plan
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        planType: planData.planType,
      },
      include: {
        storefront: {
          select: {
            id: true,
            storeUrl: true,
            storeName: true,
            themeId: true,
            primaryColor: true,
            fontFamily: true,
            isPublished: true,
            tagline: true,
          },
        },
      },
    })

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        planType: updatedUser.planType,
        emailVerified: updatedUser.emailVerified,
        createdAt: updatedUser.createdAt,
        storefront: updatedUser.storefront,
      },
      message: `${planData.planType === "creator" ? "Creator" : "Startup"} plan activated successfully`,
    }
  }

  /**
   * Complete onboarding
   */
  static async completeOnboarding(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { storefront: true },
    })

    if (!user) {
      throw new NotFoundError("User not found")
    }

    if (user.onboardingComplete) {
      throw new ConflictError("Onboarding already completed")
    }

    // Mark onboarding as complete
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingComplete: true,
      },
      include: {
        storefront: {
          select: {
            id: true,
            storeUrl: true,
            storeName: true,
            themeId: true,
            primaryColor: true,
            fontFamily: true,
            isPublished: true,
            tagline: true,
          },
        },
      },
    })

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        planType: updatedUser.planType,
        onboardingComplete: updatedUser.onboardingComplete,
        emailVerified: updatedUser.emailVerified,
        createdAt: updatedUser.createdAt,
        storefront: updatedUser.storefront,
      },
      message:
        "Onboarding completed successfully! Welcome to GenZaic Creator Hub.",
    }
  }

  /**
   * Skip onboarding (marks as complete without setting everything up)
   */
  static async skipOnboarding(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Set default plan to creator
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingComplete: false,
        planType: "creator", // Default plan
      },
      include: {
        storefront: {
          select: {
            id: true,
            storeUrl: true,
            storeName: true,
            themeId: true,
            primaryColor: true,
            fontFamily: true,
            isPublished: true,
            tagline: true,
          },
        },
      },
    })

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        planType: updatedUser.planType,
        onboardingComplete: updatedUser.onboardingComplete,
        emailVerified: updatedUser.emailVerified,
        createdAt: updatedUser.createdAt,
        storefront: updatedUser.storefront,
      },
      message: "Onboarding skipped. You can complete your profile later.",
    }
  }

  /**
   * Get onboarding status
   */
  static async getOnboardingStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        storefront: {
          include: {
            products: {
              take: 1, // Check if user has at least one product
            },
          },
        },
        kyc: true, // Include KYC for payment info check
      },
    })

    if (!user) {
      throw new NotFoundError("User not found")
    }

    const status = {
      onboardingComplete: user.onboardingComplete,
      hasProduct: (user.storefront?.products.length || 0) > 0,
      hasStorefrontSettings: !!(
        user.storefront?.storeName && user.storefront?.themeId
      ),
      hasPaymentInfo: !!(
        user.storefront?.paymentMethod &&
        (user.kyc?.accountNumber || user.storefront?.upiId)
      ),
      hasPlanSelected: !!user.planType,
    }

    return {
      status,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        planType: user.planType,
        onboardingComplete: user.onboardingComplete,
      },
    }
  }
}
