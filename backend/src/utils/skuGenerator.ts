import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// Dynamic SKU Generation Functions

/**
 * Generate flavor code from flavor name
 * "Red Twist" → "RED"
 * "Blue Raspberry" → "BLU"
 * "Fruit Rainbow" → "FRU"
 */
export const generateFlavorCode = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.substring(0, 3).toUpperCase())
    .join("");
};

/**
 * Generate category code from category name
 * "Traditional" → "TRA"
 * "Sour" → "SOU"
 * "Sweet" → "SWE"
 */
export const generateCategoryCode = (category: string): string => {
  return category.substring(0, 3).toUpperCase();
};

/**
 * Generate SKU for custom 3-pack
 * @param flavorNames Array of flavor names
 * @returns Generated SKU (e.g., "3P-CUST-RED-BLU-FRU")
 */
export const generateCustomSKU = (flavorNames: string[]): string => {
  const codes = flavorNames.map((name) => generateFlavorCode(name));
  return `3P-CUST-${codes.join("-")}`;
};

/**
 * Generate SKU for predefined pack recipe
 * @param kind Category (Traditional, Sour, Sweet)
 * @param items Array of flavor items with quantities
 * @returns Generated SKU (e.g., "3P-TRA-REDx3")
 */
export const generateSKU = (
  kind: string,
  items: Array<{ flavor: { name: string }; quantity: number }>
): string => {
  const kindCode = generateCategoryCode(kind);
  const components = items.map((item) => {
    const flavorCode = generateFlavorCode(item.flavor.name);
    return item.quantity > 1 ? `${flavorCode}x${item.quantity}` : flavorCode;
  });
  return `3P-${kindCode}-${components.join("-")}`;
};

/**
 * Get default price for product type
 * @param productType Product type (3-pack, 5-pack, etc.)
 * @returns Default price
 */
export const getDefaultPrice = async (productType: string): Promise<number> => {
  // Try to get from environment variable first
  const envPrice =
    process.env[`DEFAULT_${productType.toUpperCase().replace("-", "_")}_PRICE`];
  if (envPrice) {
    return parseFloat(envPrice);
  }

  // Fallback to hardcoded defaults
  const defaultPrices: { [key: string]: number } = {
    "3-pack": 27.0,
    "5-pack": 45.0,
  };

  return defaultPrices[productType] || 0;
};

/**
 * Validate if product type is supported
 * @param productType Product type to validate
 * @returns True if supported
 */
export const isValidProductType = async (
  productType: string
): Promise<boolean> => {
  // Check environment variable for supported types
  const supportedTypes = process.env.SUPPORTED_PRODUCT_TYPES?.split(",") || [
    "3-pack",
    "5-pack",
  ];
  return supportedTypes.includes(productType);
};

/**
 * Validate if category is supported
 * @param category Category to validate
 * @returns True if supported
 */
export const isValidCategory = async (category: string): Promise<boolean> => {
  // Check environment variable for supported categories
  const supportedCategories = process.env.SUPPORTED_CATEGORIES?.split(",") || [
    "Traditional",
    "Sour",
    "Sweet",
  ];
  return supportedCategories.includes(category);
};

/**
 * Get all available categories from database
 * @returns Array of unique categories
 */
export const getAvailableCategories = async (): Promise<string[]> => {
  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    where: { isActive: true },
  });

  return categories.map((cat) => cat.category);
};

/**
 * Get all available flavors from database
 * @returns Array of active flavors
 */
export const getAvailableFlavors = async () => {
  return await prisma.flavor.findMany({
    where: { active: true },
    select: { id: true, name: true, aliases: true },
  });
};

/**
 * Validate if flavor exists in database
 * @param flavorName Flavor name to validate
 * @returns Flavor object if exists, null otherwise
 */
export const validateFlavor = async (flavorName: string) => {
  return await prisma.flavor.findFirst({
    where: {
      OR: [
        { name: { equals: flavorName, mode: "insensitive" } },
        { aliases: { has: flavorName } },
      ],
      active: true,
    },
  });
};
