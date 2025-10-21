import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import fs from "fs";
import path from "path";
import {
  getAvailableCategories,
  getAvailableFlavors,
  generateFlavorCode,
  generateCategoryCode,
} from "../utils/skuGenerator";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";

const prisma = new PrismaClient();

// Helper function to delete image file (updated for Cloudinary)
const deleteImageFile = async (imageUrl: string | null, publicId?: string | null) => {
  if (!imageUrl && !publicId) return;

  try {
    // If we have a publicId, delete from Cloudinary
    if (publicId) {
      await deleteFromCloudinary(publicId);
      return;
    }

    // Fallback to local file deletion for old images
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      const imagePath = path.join(process.cwd(), imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
  } catch (error) {
    console.error("Error deleting image file:", error);
  }
};

// Helper function to get image filename from URL
const getImageFilename = (imageUrl: string | null): string | null => {
  if (!imageUrl) return null;
  return path.basename(imageUrl);
};

// ==================== FLAVOR MANAGEMENT ====================

// Get all flavors (Admin)
export const getAllFlavors = async (req: Request, res: Response) => {
  try {
    const flavors = await prisma.flavor.findMany({
      orderBy: { name: "asc" },
      include: {
        inventory: true,
        _count: {
          select: {
            productFlavors: true,
            packRecipeItems: true,
          },
        },
      },
    });

    res.json({ flavors });
  } catch (err) {
    console.error("Get all flavors error:", err);
    res.status(500).json({ message: "Error fetching flavors" });
  }
};

// Create new flavor (Admin)
export const createFlavor = async (req: Request, res: Response) => {
  try {
    const { name, aliases = [] } = req.body;
    const imageFile = req.file;

    // Handle aliases - could be string (JSON) or array
    let aliasesArray: string[] = [];
    if (typeof aliases === "string") {
      try {
        aliasesArray = JSON.parse(aliases);
      } catch {
        aliasesArray = aliases
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean);
      }
    } else if (Array.isArray(aliases)) {
      aliasesArray = aliases;
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Flavor name is required" });
    }

    // Check if flavor already exists (case-insensitive for both name and aliases)
    const trimmedName = name.trim();
    const lowerCaseName = trimmedName.toLowerCase();
    
    console.log(`Creating flavor: "${trimmedName}" with aliases:`, aliasesArray);
    
    const existingFlavors = await prisma.flavor.findMany({
      where: {
        OR: [
          { name: { equals: trimmedName, mode: "insensitive" } },
        ],
      },
    });

    // Check name and aliases with case-insensitive comparison
    for (const existingFlavor of existingFlavors) {
      if (existingFlavor.name.toLowerCase() === lowerCaseName) {
        return res.status(400).json({ 
          message: `Flavor "${existingFlavor.name}" already exists` 
        });
      }
      
      // Check if the new name matches any existing aliases
      if (existingFlavor.aliases.some(alias => alias.toLowerCase() === lowerCaseName)) {
        return res.status(400).json({ 
          message: `A flavor with alias "${trimmedName}" already exists` 
        });
      }
    }

    // Check if any of the new aliases conflict with existing flavor names or aliases
    const allFlavors = await prisma.flavor.findMany();
    for (const alias of aliasesArray) {
      const lowerAlias = alias.toLowerCase();
      for (const existingFlavor of allFlavors) {
        if (existingFlavor.name.toLowerCase() === lowerAlias) {
          return res.status(400).json({ 
            message: `Alias "${alias}" conflicts with existing flavor "${existingFlavor.name}"` 
          });
        }
        if (existingFlavor.aliases.some(a => a.toLowerCase() === lowerAlias)) {
          return res.status(400).json({ 
            message: `Alias "${alias}" already exists in flavor "${existingFlavor.name}"` 
          });
        }
      }
    }

    // Handle uploaded image - upload to Cloudinary
    let imageUrl: string | null = null;
    let cloudinaryPublicId: string | null = null;
    if (imageFile) {
      const uploadResult = await uploadToCloudinary(imageFile, 'flavors');
      imageUrl = uploadResult.url;
      cloudinaryPublicId = uploadResult.public_id;
    }

    const flavor = await prisma.$transaction(async (tx) => {
      // Create flavor with optional image
      const newFlavor = await tx.flavor.create({
        data: {
          name: name.trim(),
          aliases: aliasesArray.filter(Boolean),
          active: true,
          imageUrl: imageUrl,
          cloudinaryPublicId: cloudinaryPublicId,
        },
      });

      // Create inventory entry
      await tx.flavorInventory.create({
        data: {
          flavorId: newFlavor.id,
          onHand: 0,
          reserved: 0,
          safetyStock: 5,
        },
      });

      return newFlavor;
    });

    res.status(201).json({
      message: "Flavor created successfully",
      flavor,
      generatedCode: generateFlavorCode(name.trim()),
    });
  } catch (err: any) {
    console.error("Create flavor error:", err);
    
    // Provide more specific error messages
    let errorMessage = "Error creating flavor";
    
    if (err.code === 'P2002') {
      // Prisma unique constraint violation
      errorMessage = "A flavor with this name already exists";
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update flavor (Admin)
export const updateFlavor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, aliases, active } = req.body;
    const imageFile = req.file;

    // Get the current flavor to check for existing image
    const currentFlavor = await prisma.flavor.findUnique({
      where: { id },
      select: { imageUrl: true, cloudinaryPublicId: true },
    });

    if (!currentFlavor) {
      return res.status(404).json({ message: "Flavor not found" });
    }

    // Handle aliases - could be string (JSON) or array
    let aliasesArray: string[] = [];
    if (aliases !== undefined) {
      if (typeof aliases === "string") {
        try {
          aliasesArray = JSON.parse(aliases);
        } catch {
          aliasesArray = aliases
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(aliases)) {
        aliasesArray = aliases;
      }
    }

    const updateData: any = {
      name: name ? name.trim() : undefined,
      aliases: aliases !== undefined ? aliasesArray.filter(Boolean) : undefined,
      active: active !== undefined ? Boolean(active) : undefined,
    };

    // If a new image is uploaded, update the imageUrl and delete the old one
    if (imageFile) {
      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(imageFile, 'flavors');
      updateData.imageUrl = uploadResult.url;
      updateData.cloudinaryPublicId = uploadResult.public_id;
      
      // Delete the old image from Cloudinary if it exists
      if (currentFlavor.cloudinaryPublicId) {
        await deleteImageFile(null, currentFlavor.cloudinaryPublicId);
      }
    }

    const flavor = await prisma.flavor.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: "Flavor updated successfully",
      flavor,
      generatedCode: generateFlavorCode(flavor.name),
    });
  } catch (err) {
    console.error("Update flavor error:", err);
    res.status(500).json({ message: "Error updating flavor" });
  }
};

// Delete flavor (Admin)
export const deleteFlavor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get the flavor to check for image before deletion
    const flavor = await prisma.flavor.findUnique({
      where: { id },
      select: { imageUrl: true, cloudinaryPublicId: true },
    });

    if (!flavor) {
      return res.status(404).json({ message: "Flavor not found" });
    }

    // Check if flavor is used in any products
    const usageCount = await prisma.productFlavor.count({
      where: { flavorId: id },
    });

    if (usageCount > 0) {
      return res.status(400).json({
        message: `Cannot delete flavor. It is used in ${usageCount} product(s).`,
      });
    }

    await prisma.$transaction(async (tx) => {
      // Delete inventory first
      await tx.flavorInventory.deleteMany({
        where: { flavorId: id },
      });

      // Delete flavor
      await tx.flavor.delete({
        where: { id },
      });
    });

    // Delete the image file from Cloudinary if it exists
    if (flavor.cloudinaryPublicId) {
      await deleteImageFile(null, flavor.cloudinaryPublicId);
    }

    res.json({ message: "Flavor deleted successfully" });
  } catch (err) {
    console.error("Delete flavor error:", err);
    res.status(500).json({ message: "Error deleting flavor" });
  }
};

// Bulk update flavor images (Admin)
export const bulkUpdateFlavorImages = async (req: Request, res: Response) => {
  try {
    const { flavorIds, imageUrl } = req.body;

    if (!flavorIds || !Array.isArray(flavorIds) || flavorIds.length === 0) {
      return res.status(400).json({
        message: "flavorIds array is required and must not be empty",
      });
    }

    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(400).json({
        message: "imageUrl is required",
      });
    }

    // Update all specified flavors with the new image
    const updateResult = await prisma.flavor.updateMany({
      where: {
        id: {
          in: flavorIds,
        },
      },
      data: {
        imageUrl: imageUrl,
        updatedAt: new Date(),
      },
    });

    res.json({
      message: `Successfully updated ${updateResult.count} flavors with new image`,
      updatedCount: updateResult.count,
      imageUrl: imageUrl,
    });
  } catch (err) {
    console.error("Bulk update flavor images error:", err);
    res.status(500).json({ message: "Error updating flavor images" });
  }
};

// Clean up orphaned flavor images (Admin)
export const cleanupOrphanedImages = async (req: Request, res: Response) => {
  try {
    const uploadsDir = path.join(process.cwd(), "uploads", "flavors");

    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        message: "No uploads directory found",
        deletedCount: 0,
        orphanedFiles: [],
      });
    }

    // Get all image files in the uploads directory
    const imageFiles = fs.readdirSync(uploadsDir);

    // Get all image URLs currently used by flavors
    const flavors = await prisma.flavor.findMany({
      select: { imageUrl: true },
    });

    const usedImageFiles = flavors
      .map((flavor) => getImageFilename(flavor.imageUrl))
      .filter(Boolean);

    // Find orphaned files (files not referenced by any flavor)
    const orphanedFiles = imageFiles.filter(
      (file) => !usedImageFiles.includes(file)
    );

    // Delete orphaned files
    let deletedCount = 0;
    for (const file of orphanedFiles) {
      try {
        const filePath = path.join(uploadsDir, file);
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting orphaned file ${file}:`, error);
      }
    }

    res.json({
      message: `Cleanup completed. Deleted ${deletedCount} orphaned files.`,
      deletedCount,
      orphanedFiles: orphanedFiles.slice(0, 10), // Show first 10 for reference
    });
  } catch (err) {
    console.error("Cleanup orphaned images error:", err);
    res.status(500).json({ message: "Error cleaning up orphaned images" });
  }
};

// ==================== CATEGORY MANAGEMENT ====================

// Get all categories (Admin)
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    // Get categories from Category table
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    // Get category usage counts
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const count = await prisma.product.count({
          where: { category: category.name, isActive: true },
        });
        return {
          id: category.id,
          name: category.name,
          productCount: count,
          generatedCode: generateCategoryCode(category.name),
          createdAt: category.createdAt,
        };
      })
    );

    res.json({ categories: categoryStats });
  } catch (err) {
    console.error("Get all categories error:", err);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

// Create new category (Admin)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
      },
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        isActive: true,
      },
    });

    res.status(201).json({
      message: "Category created successfully",
      category: {
        id: category.id,
        name: category.name,
        generatedCode: generateCategoryCode(category.name),
      },
    });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ message: "Error creating category" });
  }
};

// Update category (Admin)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    res.json({
      message: "Category updated successfully",
      category: {
        id: category.id,
        name: category.name,
        isActive: category.isActive,
      },
    });
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ message: "Error updating category" });
  }
};

// Delete category (Admin)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if category is used in any products
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const usageCount = await prisma.product.count({
      where: { category: category.name },
    });

    if (usageCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It is used in ${usageCount} product(s).`,
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ message: "Error deleting category" });
  }
};

// ==================== INVENTORY MANAGEMENT ====================

// Update flavor inventory (Admin)
export const updateFlavorInventory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { onHand, reserved, safetyStock, stock } = req.body;

    // Support both 'stock' and 'onHand' for backward compatibility
    const newOnHand =
      stock !== undefined
        ? parseInt(stock)
        : onHand !== undefined
        ? parseInt(onHand)
        : undefined;

    const inventory = await prisma.flavorInventory.update({
      where: { flavorId: id },
      data: {
        onHand: newOnHand,
        reserved: reserved !== undefined ? parseInt(reserved) : undefined,
        safetyStock:
          safetyStock !== undefined ? parseInt(safetyStock) : undefined,
      },
    });

    res.json({
      message: "Inventory updated successfully",
      inventory,
    });
  } catch (err) {
    console.error("Update inventory error:", err);
    res.status(500).json({ message: "Error updating inventory" });
  }
};

// Get inventory alerts (Admin)
export const getInventoryAlerts = async (req: Request, res: Response) => {
  try {
    // Get all inventory records and filter those where onHand <= safetyStock
    const alerts = await prisma.flavorInventory.findMany({
      include: {
        flavor: true,
      },
      orderBy: { onHand: "asc" },
    });

    // Filter alerts where stock is at or below safety stock level
    const lowStockAlerts = alerts.filter(
      (inventory) => inventory.onHand <= inventory.safetyStock
    );

    res.json({ alerts: lowStockAlerts });
  } catch (err) {
    console.error("Get inventory alerts error:", err);
    res.status(500).json({ message: "Error fetching inventory alerts" });
  }
};

// ==================== SYSTEM CONFIGURATION ====================

// Get system configuration (Admin)
export const getSystemConfig = async (req: Request, res: Response) => {
  try {
    const config = {
      supportedCategories: process.env.SUPPORTED_CATEGORIES?.split(",") || [
        "Traditional",
        "Sour",
        "Sweet",
      ],
      supportedProductTypes: process.env.SUPPORTED_PRODUCT_TYPES?.split(
        ","
      ) || ["3-pack", "5-pack"],
      defaultPrices: {
        "3-pack": parseFloat(process.env.DEFAULT_3PACK_PRICE || "27.00"),
        "5-pack": parseFloat(process.env.DEFAULT_5PACK_PRICE || "45.00"),
      },
      totalFlavors: await prisma.flavor.count(),
      totalProducts: await prisma.product.count(),
      totalCategories: (await getAvailableCategories()).length,
    };

    res.json({ config });
  } catch (err) {
    console.error("Get system config error:", err);
    res.status(500).json({ message: "Error fetching system configuration" });
  }
};

