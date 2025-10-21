// SINGLE PRODUCT CART - COMMENTED OUT (ONLY USING 3-PACK CART)
/*
import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export const addToCart = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, isVerified: true }
    });
    
    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      size,
      options,
      quantity,
      total,
      orderNotes,
      title,
      stikersName,
      sizeAndQuantity,
      colorsName,
      colorsCode,
    } = req.body;

    // Handle uploaded images
    let imageUrl = null;
    let stikersImgeUrl: string[] = [];

    // Main product image
    if (req.file) {
      imageUrl = `/uploads/cart/${req.file.filename}`;
    }

    // Sticker images (multiple files)
    if (req.files && Array.isArray(req.files)) {
      stikersImgeUrl = req.files.map(
        (file: any) => `/uploads/stickers/${file.filename}`
      );
    }

    // Filter out undefined values and provide defaults
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: user.id,
        title: title || "Untitled Product",
        imageUrl: imageUrl || null,
        stikersImgeUrl: stikersImgeUrl || [],
        stikersName: stikersName
          ? Array.isArray(stikersName)
            ? stikersName.filter(Boolean)
            : [stikersName].filter(Boolean)
          : [],
        size: size || null,
        sizeAndQuantity: sizeAndQuantity
          ? typeof sizeAndQuantity === "string"
            ? JSON.parse(sizeAndQuantity)
            : sizeAndQuantity
          : null,
        colorsName: colorsName || null,
        colorsCode: colorsCode || null,
        options: options
          ? Array.isArray(options)
            ? options.filter(Boolean)
            : JSON.parse(options || "[]").filter(Boolean)
          : [],
        quantity: parseInt(quantity) || 1,
        total: parseFloat(total) || 0,
        orderNotes: orderNotes || null,
      },
    });

    res.status(201).json({ message: "Added to cart", cartItem });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Error adding to cart" });
  }
};

export const getUserCart = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const cart = await prisma.cartItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart" });
  }
};

export const deleteUserCart = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const cartItemId = req.params.id;

    // Find the cart item by id and user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId: user.id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    res.json({ message: "Cart item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting cart item" });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const cartItemId = req.params.id;
    const { quantity, total } = req.body;

    // Find the cart item by id and user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId: user.id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity: quantity ? parseInt(quantity) : undefined,
        total: total ? parseFloat(total) : undefined,
      },
    });

    res.json({
      message: "Cart item updated successfully",
      cartItem: updatedCartItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating cart item" });
  }
};

export const clearUserCart = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart" });
  }
};
*/
