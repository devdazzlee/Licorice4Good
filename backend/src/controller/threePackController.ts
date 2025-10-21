import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// SKU generation helper
const generateSKU = (
  kind: string,
  items: Array<{ flavor: { name: string }; quantity: number }>
): string => {
  const kindMap: { [key: string]: string } = {
    Traditional: "TRD",
    Sour: "SOR",
    Sweet: "SWE",
  };

  const flavorCodeMap: { [key: string]: string } = {
    "Red Twist": "RED",
    "Blue Raspberry": "BLURAS",
    "Fruit Rainbow": "FRURAI",
    "Green Apple": "GREAPP",
    Watermelon: "WAT",
    Cherry: "CHE",
    "Berry Delight": "BERDEL",
    "Cotton Candy": "COT",
    "Strawberry Banana": "STRBAN",
  };

  const kindCode = kindMap[kind] || "UNK";

  // Generate component codes
  const components = items.map((item) => {
    const flavorCode = flavorCodeMap[item.flavor.name] || "UNK";
    return item.quantity > 1 ? `${flavorCode}x${item.quantity}` : flavorCode;
  });

  return `3P-${kindCode}-${components.join("-")}`;
};

// Get 3-pack product with all active variants
export const getThreePackProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: "3-pack" },
    });

    if (!product) {
      return res.status(404).json({ message: "3-pack product not found" });
    }

    // Get all active pack recipes with their items and flavors
    const packRecipes = await prisma.packRecipe.findMany({
      where: { active: true },
      include: {
        items: {
          include: {
            flavor: true,
          },
        },
      },
      orderBy: [{ kind: "asc" }, { title: "asc" }],
    });

    // Transform to match the API contract
    const variants = packRecipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      kind: recipe.kind,
      items: recipe.items.map((item) => ({
        flavor_id: item.flavor.id,
        flavor_name: item.flavor.name,
        qty: item.quantity,
      })),
      active: recipe.active,
      sku: generateSKU(recipe.kind, recipe.items),
    }));

    const response = {
      id: product.id,
      title: product.name,
      price: product.price,
      currency: "USD",
      tax_code: "candy",
      options_ui: "cards",
      variants,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching 3-pack product:", error);
    res.status(500).json({ message: "Error fetching 3-pack product" });
  }
};

// Get inventory availability for a specific recipe
export const getInventoryAvailability = async (req: Request, res: Response) => {
  try {
    const { recipe_id, qty = 1 } = req.query;

    if (!recipe_id) {
      return res.status(400).json({ message: "recipe_id is required" });
    }

    // Get the pack recipe with its items
    const packRecipe = await prisma.packRecipe.findUnique({
      where: { id: recipe_id as string },
      include: {
        items: {
          include: {
            flavor: {
              include: {
                inventory: true,
              },
            },
          },
        },
      },
    });

    if (!packRecipe) {
      return res.status(404).json({ message: "Pack recipe not found" });
    }

    const requestedQty = parseInt(qty as string);
    const availability = [];

    for (const item of packRecipe.items) {
      const inventory = item.flavor.inventory;
      if (!inventory) {
        availability.push({
          flavor_id: item.flavor.id,
          flavor_name: item.flavor.name,
          required: item.quantity * requestedQty,
          available: 0,
          on_hand: 0,
          reserved: 0,
          safety_stock: 0,
          available_after_safety: 0,
        });
        continue;
      }

      const required = item.quantity * requestedQty;
      const available = inventory.onHand - inventory.reserved;
      const availableAfterSafety = available - inventory.safetyStock;

      availability.push({
        flavor_id: item.flavor.id,
        flavor_name: item.flavor.name,
        required,
        available,
        on_hand: inventory.onHand,
        reserved: inventory.reserved,
        safety_stock: inventory.safetyStock,
        available_after_safety: availableAfterSafety,
      });
    }

    // Check if recipe is purchasable
    const isPurchasable = availability.every(
      (item) => item.available_after_safety >= item.required
    );
    const limitingFactor = availability.find(
      (item) => item.available_after_safety < item.required
    );

    res.json({
      recipe_id,
      requested_qty: requestedQty,
      is_purchasable: isPurchasable,
      limiting_factor: limitingFactor
        ? {
            flavor_name: limitingFactor.flavor_name,
            available: limitingFactor.available_after_safety,
            required: limitingFactor.required,
          }
        : null,
      availability,
    });
  } catch (error) {
    console.error("Error checking inventory availability:", error);
    res.status(500).json({ message: "Error checking inventory availability" });
  }
};

// Get all flavors (for admin management)
export const getAllFlavors = async (req: Request, res: Response) => {
  try {
    const flavors = await prisma.flavor.findMany({
      include: {
        inventory: true,
      },
      orderBy: { name: "asc" },
    });

    res.json(flavors);
  } catch (error) {
    console.error("Error fetching flavors:", error);
    res.status(500).json({ message: "Error fetching flavors" });
  }
};

// Get all pack recipes (for admin management)
export const getAllPackRecipes = async (req: Request, res: Response) => {
  try {
    const packRecipes = await prisma.packRecipe.findMany({
      include: {
        items: {
          include: {
            flavor: true,
          },
        },
      },
      orderBy: [{ kind: "asc" }, { title: "asc" }],
    });

    res.json(packRecipes);
  } catch (error) {
    console.error("Error fetching pack recipes:", error);
    res.status(500).json({ message: "Error fetching pack recipes" });
  }
};

// Create new flavor (Admin only)
export const createFlavor = async (req: Request, res: Response) => {
  try {
    const { name, aliases = [], active = true } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Flavor name is required" });
    }

    // Check if flavor already exists
    const existingFlavor = await prisma.flavor.findUnique({
      where: { name: name.trim() },
    });

    if (existingFlavor) {
      return res.status(400).json({ message: "Flavor with this name already exists" });
    }

    const flavor = await prisma.flavor.create({
      data: {
        name: name.trim(),
        aliases: Array.isArray(aliases) ? aliases : [],
        active: Boolean(active),
      },
    });

    res.status(201).json(flavor);
  } catch (error) {
    console.error("Error creating flavor:", error);
    res.status(500).json({ message: "Error creating flavor" });
  }
};

// Update flavor (Admin only)
export const updateFlavor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, aliases, active } = req.body;

    const updateData: any = {};
    
    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (aliases !== undefined) {
      updateData.aliases = Array.isArray(aliases) ? aliases : [];
    }
    if (active !== undefined) {
      updateData.active = Boolean(active);
    }

    const flavor = await prisma.flavor.update({
      where: { id },
      data: updateData,
    });

    res.json(flavor);
  } catch (error) {
    console.error("Error updating flavor:", error);
    res.status(500).json({ message: "Error updating flavor" });
  }
};

// Delete flavor (Admin only)
export const deleteFlavor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if flavor is used in any products or recipes
    const productFlavors = await prisma.productFlavor.findFirst({
      where: { flavorId: id },
    });

    const packRecipeItems = await prisma.packRecipeItem.findFirst({
      where: { flavorId: id },
    });

    if (productFlavors || packRecipeItems) {
      return res.status(400).json({ 
        message: "Cannot delete flavor that is used in products or recipes" 
      });
    }

    await prisma.flavor.delete({
      where: { id },
    });

    res.json({ message: "Flavor deleted successfully" });
  } catch (error) {
    console.error("Error deleting flavor:", error);
    res.status(500).json({ message: "Error deleting flavor" });
  }
};
