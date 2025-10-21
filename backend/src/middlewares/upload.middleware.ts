import multer from "multer";

// Use memory storage for Cloudinary uploads
// Files will be stored in memory as buffers and uploaded to Cloudinary
const storage = multer.memoryStorage();

// File filter
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check file type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};
// 
// Configure multer for Cloudinary uploads
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit - Cloudinary will handle compression
    files: 10, // Maximum 10 files
  },
});

// Export different upload configurations
export const uploadProductImage = upload.single("productImage");
export const uploadFlavorImage = upload.single("flavorImage");
// SINGLE PRODUCT CART UPLOADS - COMMENTED OUT (ONLY USING 3-PACK CART)
/*
export const uploadCartImage = upload.single("cartImage");
export const uploadStickerImages = upload.array("stickerImages", 5); // Max 5 sticker images
export const uploadMultipleImages = upload.fields([
  { name: "productImage", maxCount: 1 },
  { name: "stickerImages", maxCount: 5 },
]);
*/

// Error handling middleware
export const handleUploadError = (
  error: any,
  req: any,
  res: any,
  next: any
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        message:
          "File too large. Maximum size is 500MB. Please compress your image and try again.",
        code: "FILE_TOO_LARGE",
        maxSize: "500MB",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "Too many files. Maximum is 10 files.",
        code: "TOO_MANY_FILES",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "Unexpected field name.",
        code: "UNEXPECTED_FIELD",
      });
    }
    if (error.code === "LIMIT_FIELD_KEY") {
      return res.status(400).json({
        message: "Field name too long.",
        code: "FIELD_NAME_TOO_LONG",
      });
    }
    if (error.code === "LIMIT_FIELD_VALUE") {
      return res.status(400).json({
        message: "Field value too long.",
        code: "FIELD_VALUE_TOO_LONG",
      });
    }
    if (error.code === "LIMIT_FIELD_COUNT") {
      return res.status(400).json({
        message: "Too many fields.",
        code: "TOO_MANY_FIELDS",
      });
    }
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({
      message: "Only image files are allowed!",
      code: "INVALID_FILE_TYPE",
    });
  }

  next(error);
};
