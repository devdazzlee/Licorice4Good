import { Flavor } from "../generated/prisma";
import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import {
  generateCustomSKU,
  generateSKU,
  getDefaultPrice,
  isValidProductType,
  validateFlavor,
} from "../utils/skuGenerator";

const prisma = new PrismaClient();

// Add 3-pack to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const guestId = (req as any).guestId;
    const isGuest = (req as any).isGuest;
    const { product_id, recipe_id, flavor_ids, qty } = req.body;
    
    // Get user or guest identifier
    const userId = user?.id || null;
    const userIdentifier = isGuest ? { guestId } : { userId };

    // Validate required fields - only product_id and qty are always required
    if (!product_id || !qty) {
      return res.status(400).json({
        message: "Missing required fields: product_id and qty are required",
      });
    }

    // Either recipe_id or flavor_ids must be provided, but not both
    if (!recipe_id && !flavor_ids) {
      return res.status(400).json({
        message: "Either recipe_id or flavor_ids must be provided",
      });
    }

    // Either recipe_id OR flavor_ids must be provided, but not both
    if (recipe_id && flavor_ids) {
      return res.status(400).json({
        message: "Cannot specify both recipe_id and flavor_ids",
      });
    }

    // For backward compatibility, allow requests without recipe_id or flavor_ids
    // This will be handled by the existing logic below

    // Validate product_id using dynamic validation
    if (!(await isValidProductType(product_id))) {
      return res.status(400).json({
        message: `Product type '${product_id}' is not supported`,
      });
    }

    const requestedQty = parseInt(qty);
    if (requestedQty <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    //Handle custom packs
    if (flavor_ids) {
      //Validate exactly 3 unique flavors
      if (!Array.isArray(flavor_ids) || flavor_ids.length !== 3) {
        return res.status(400).json({
          message: "flavor_ids must contain exactly 3 unique flavors",
        });
      }

      //Check for duplicates
      // const uniqueFlavors = [...new Set(flavor_ids)];
      // if (uniqueFlavors.length !== 3) {
      //   return res.status(400).json({
      //     message: "flavor_ids must contain exactly 3 unique flavors",
      //   });
      // }
      //Fetch flavors details and check availability
      const flavors = await prisma.flavor.findMany({
        where: { id: { in: flavor_ids }, active: true },
        include: {
          inventory: true,
        },
      });

      if (flavors.length !== 3) {
        return res.status(400).json({
          message: "One or more flavors in flavor_ids are not active",
        });
      }

      //Check inventory availability for flavors
      for (const flavor of flavors) {
        const inventory = flavor.inventory;
        if (!inventory) {
          return res.status(400).json({
            message: `No inventory found for flavor: ${flavor.name}`,
          });
        }

        const available =
          inventory.onHand - inventory.reserved - inventory.safetyStock;
        if (available < requestedQty) {
          return res.status(400).json({
            message: `Insufficient stock for ${flavor.name}.Available : ${available}, Required: ${requestedQty}`,
          });
        }
      }
      //Generate SKU
      const flavorNames = flavors.map((f) => f.name);
      const sku = generateCustomSKU(flavorNames);

      //Check if user already has this custom pack in cart
      const existingCartLine = await prisma.cartLine.findFirst({
        where: {
          ...userIdentifier,
          productId: product_id,
          flavorIds: { equals: flavor_ids },
        },
      });

      let cartLine;
      if (existingCartLine) {
        //Update existing cart line
        cartLine = await prisma.cartLine.update({
          where: { id: existingCartLine.id },
          data: {
            quantity: existingCartLine.quantity + requestedQty,
            unitPrice: await getDefaultPrice(product_id),
          },
        });
      } else {
        //Create new cart line
        cartLine = await prisma.cartLine.create({
          data: {
            ...userIdentifier,
            productId: product_id,
            flavorIds: flavor_ids,
            quantity: requestedQty,
            unitPrice: await getDefaultPrice(product_id),
            sku: sku,
          },
        });
      }
      //Reserve inventory for custom pack
      for (const flavor of flavors) {
        const inventory = flavor.inventory;
        if (!inventory) {
          return res.status(400).json({
            message: `No inventory found for flavor: ${flavor.name}`,
          });
        }
        await prisma.flavorInventory.update({
          where: { flavorId: flavor.id },
          data: {
            reserved: inventory.reserved + requestedQty,
          },
        });
      }

      res.status(201).json({
        message: {
          id: cartLine.id,
          product_id: cartLine.productId,
          flavor_ids: cartLine.flavorIds,
          quantity: cartLine.quantity,
          unit_price: cartLine.unitPrice,
          total: cartLine.quantity * cartLine.unitPrice,
          sku: cartLine.sku,
          flavors: flavors.map((f) => ({
            id: f.id,
            name: f.name,
          })),
        },
      });
      return;
    }

    // Handle case where neither recipe_id nor flavor_ids are provided
    // This is for backward compatibility with the original system
    if (!recipe_id && !flavor_ids) {
      return res.status(400).json({
        message:
          "Either recipe_id (for preset packs) or flavor_ids (for custom packs) must be provided",
      });
    }

    // Get the pack recipe with its items and flavors
    const packRecipe = await prisma.packRecipe.findUnique({
      where: { id: recipe_id },
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

    if (!packRecipe.active) {
      return res.status(400).json({ message: "Pack recipe is not active" });
    }

    // Validate recipe total = 3
    const totalItems = packRecipe.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    if (totalItems !== 3) {
      return res.status(400).json({
        message: `Invalid recipe: total items is ${totalItems}, must be 3`,
      });
    }

    // Check inventory availability
    for (const item of packRecipe.items) {
      const inventory = item.flavor.inventory;
      if (!inventory) {
        return res.status(400).json({
          message: `No inventory found for flavor: ${item.flavor.name}`,
        });
      }

      const required = item.quantity * requestedQty;
      const available =
        inventory.onHand - inventory.reserved - inventory.safetyStock;

      if (available < required) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.flavor.name}. Available: ${available}, Required: ${required}`,
        });
      }
    }

    // Generate SKU
    const sku = generateSKU(packRecipe.kind, packRecipe.items);

    // Check if user already has this recipe in cart
    const existingCartLine = await prisma.cartLine.findFirst({
      where: {
        ...userIdentifier,
        productId: product_id,
        recipeId: recipe_id,
      },
    });

    let cartLine;
    if (existingCartLine) {
      // Update existing cart line
      cartLine = await prisma.cartLine.update({
        where: { id: existingCartLine.id },
        data: {
          quantity: existingCartLine.quantity + requestedQty,
          unitPrice: await getDefaultPrice(product_id), // Dynamic price
        },
        include: {
          packRecipe: {
            include: {
              items: {
                include: {
                  flavor: true,
                },
              },
            },
          },
        },
      });
    } else {
      // Create new cart line
      cartLine = await prisma.cartLine.create({
        data: {
          ...userIdentifier,
          productId: product_id,
          recipeId: recipe_id,
          quantity: requestedQty,
          unitPrice: await getDefaultPrice(product_id), // Dynamic price
          sku: sku,
        },
        include: {
          packRecipe: {
            include: {
              items: {
                include: {
                  flavor: true,
                },
              },
            },
          },
        },
      });
    }

    // Reserve inventory
    for (const item of packRecipe.items) {
      const inventory = item.flavor.inventory;
      if (!inventory) {
        return res.status(400).json({
          message: `No inventory found for flavor: ${item.flavor.name}`,
        });
      }
      const reserveAmount = item.quantity * requestedQty;

      await prisma.flavorInventory.update({
        where: { flavorId: item.flavor.id },
        data: {
          reserved: inventory.reserved + reserveAmount,
        },
      });
    }

    res.status(201).json({
      message: "Added to cart",
      cartLine: {
        id: cartLine.id,
        product_id: cartLine.productId,
        recipe_id: cartLine.recipeId,
        recipe_title: cartLine.packRecipe?.title || "Custom Pack",
        quantity: cartLine.quantity,
        unit_price: cartLine.unitPrice,
        total: cartLine.quantity * cartLine.unitPrice,
        sku: cartLine.sku,
      },
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Error adding to cart" });
  }
};

// Get user's 3-pack cart
export const getUserCart = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const guestId = (req as any).guestId;
    const isGuest = (req as any).isGuest;
    
    // Get user or guest identifier
    const userIdentifier = isGuest ? { guestId } : { userId: user?.id };

    const cartLines = await prisma.cartLine.findMany({
      where: userIdentifier,
      include: {
        packRecipe: {
          include: {
            items: {
              include: {
                flavor: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch flavor details for custom packs
    const customPackLines = cartLines.filter(
      (line) => !line.recipeId && line.flavorIds && line.flavorIds.length > 0
    );
    const allFlavorIds = [
      ...new Set(customPackLines.flatMap((line) => line.flavorIds)),
    ];
    const flavors =
      allFlavorIds.length > 0
        ? await prisma.flavor.findMany({
            where: { id: { in: allFlavorIds } },
            select: { id: true, name: true },
          })
        : [];

    const cart = cartLines.map((line) => {
      // For custom packs (no recipeId), use flavorIds directly
      if (!line.recipeId && line.flavorIds && line.flavorIds.length > 0) {
        // This is a custom pack - use fetched flavor details
        return {
          id: line.id,
          product_id: line.productId,
          recipe_id: line.recipeId,
          recipe_title: "Custom Pack",
          recipe_kind: "Custom",
          quantity: line.quantity,
          unit_price: line.unitPrice,
          total: line.quantity * line.unitPrice,
          sku: line.sku,
          items: line.flavorIds.map((flavorId) => {
            const flavor = flavors.find((f) => f.id === flavorId);
            return {
              flavor_id: flavorId,
              flavor_name:
                flavor?.name ||
                flavorId
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase()),
              quantity: 1,
            };
          }),
        };
      } else {
        // This is a pre-defined pack
        return {
          id: line.id,
          product_id: line.productId,
          recipe_id: line.recipeId,
          recipe_title: line.packRecipe?.title || "Custom Pack",
          recipe_kind: line.packRecipe?.kind || "Custom",
          quantity: line.quantity,
          unit_price: line.unitPrice,
          total: line.quantity * line.unitPrice,
          sku: line.sku,
          items:
            line.packRecipe?.items.map((item) => ({
              flavor_id: item.flavor.id,
              flavor_name: item.flavor.name,
              quantity: item.quantity,
            })) || [],
        };
      }
    });

    const cartTotal = cart.reduce((sum, line) => sum + line.total, 0);

    // Populate flavor names for custom packs
    const cartWithFlavorNames = await Promise.all(
      cart.map(async (cartItem: any) => {
        if (cartItem.recipe_kind === "Custom" && cartItem.items.length > 0) {
          // Fetch flavors details for custom packs
          const flavors = await prisma.flavor.findMany({
            where: {
              id: { in: cartItem.items.map((item: any) => item.flavor_id) },
            },
            select: { id: true, name: true },
          });

          // Update the cart item with flavor names
          cartItem.items = cartItem.items.map((item: any) => ({
            ...item,
            flavor_name:
              flavors.find((f) => f.id === item.flavor_id)?.name ||
              "Unknown Flavor",
          }));
        }
        return cartItem;
      })
    );

    const finalCartTotal = cartWithFlavorNames.reduce(
      (sum: number, line: any) => sum + line.total,
      0
    );

    res.json({
      cart: cartWithFlavorNames,
      total_items: cartLines.length,
      cart_total: finalCartTotal,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Error fetching cart" });
  }
};

// Update cart line quantity
export const updateCartLine = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const guestId = (req as any).guestId;
    const isGuest = (req as any).isGuest;
    const cartLineId = req.params.id;
    const { qty } = req.body;

    if (!qty || qty <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    // Get user or guest identifier
    const userIdentifier = isGuest ? { guestId } : { userId: user?.id };

    // Find the cart line
    const cartLine = await prisma.cartLine.findFirst({
      where: {
        id: cartLineId,
        ...userIdentifier,
      },
      include: {
        packRecipe: {
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
        },
      },
    });

    if (!cartLine) {
      return res.status(404).json({ message: "Cart line not found" });
    }

    const newQty = parseInt(qty);
    const qtyDifference = newQty - cartLine.quantity;

    if (!cartLine.packRecipe && cartLine.flavorIds.length > 0) {
      //fetch flavors details for custom packs
      const flavors = await prisma.flavor.findMany({
        where: { id: { in: cartLine.flavorIds } },
        include: { inventory: true },
      });

      if (qtyDifference > 0) {
        //Check if we can add more items for custom packs
        for (const flavor of flavors) {
          const inventory = flavor.inventory;
          if (!inventory) {
            return res.status(400).json({
              message: `No inventory found for flavor: ${flavor.name}`,
            });
          }
          const available =
            inventory.onHand - inventory.reserved - inventory.safetyStock;
          if (available < qtyDifference) {
            return res.status(400).json({
              message: `Insufficient stock for ${flavor.name}. Available: ${available}, Required: ${qtyDifference}`,
            });
          }
        }

        //Reserve additional inventory for custom packs
        for (const flavor of flavors) {
          const inventory = flavor.inventory;
          if (!inventory) continue;

          await prisma.flavorInventory.update({
            where: { flavorId: flavor.id },
            data: {
              reserved: inventory.reserved + qtyDifference,
            },
          });
        }
      } else if (qtyDifference < 0) {
        for (const flavor of flavors) {
          const inventory = flavor.inventory;
          if (!inventory) continue;

          await prisma.flavorInventory.update({
            where: { flavorId: flavor.id },
            data: {
              reserved: Math.max(
                0,
                inventory.reserved - Math.abs(qtyDifference)
              ),
            },
          });
        }
      }

      //Update cart line for custom pack
      const updateCartLine = await prisma.cartLine.update({
        where: { id: cartLineId },
        data: { quantity: newQty },
      });
      res.json({
        message: "Custom pack quantity updated successfully",
        cartLine: {
          id: updateCartLine.id,
          product_id: updateCartLine.productId,
          recipe_id: null,
          recipe_title: "Custom Pack",
          quantity: updateCartLine.quantity,
          unit_price: updateCartLine.unitPrice,
          total: updateCartLine.quantity * updateCartLine.unitPrice,
          sku: updateCartLine.sku,
        },
      });
      return;
    }
    // if (!cartLine.packRecipe) {
    //   return res.status(400).json({
    //     message:
    //       "Cannot update custom pack quantities. Remove and re-add to cart.",
    //   });
    // }

    // Handle predefined recipes
    if (cartLine.packRecipe) {
      if (qtyDifference > 0) {
        // Check if we can add more items
        for (const item of cartLine.packRecipe.items) {
          const inventory = item.flavor.inventory;
          if (!inventory) {
            return res.status(400).json({
              message: `No inventory found for flavor: ${item.flavor.name}`,
            });
          }
          const required = item.quantity * qtyDifference;
          const available =
            inventory.onHand - inventory.reserved - inventory.safetyStock;

          if (available < required) {
            return res.status(400).json({
              message: `Insufficient stock for ${item.flavor.name}. Available: ${available}, Required: ${required}`,
            });
          }
        }

        // Reserve additional inventory
        for (const item of cartLine.packRecipe.items) {
          const inventory = item.flavor.inventory;
          if (!inventory) {
            return res.status(400).json({
              message: `No inventory found for flavor: ${item.flavor.name}`,
            });
          }
          const reserveAmount = item.quantity * qtyDifference;

          await prisma.flavorInventory.update({
            where: { flavorId: item.flavor.id },
            data: {
              reserved: inventory.reserved + reserveAmount,
            },
          });
        }
      } else if (qtyDifference < 0) {
        // Release inventory
        for (const item of cartLine.packRecipe.items) {
          const inventory = item.flavor.inventory;
          if (!inventory) {
            return res.status(400).json({
              message: `No inventory found for flavor: ${item.flavor.name}`,
            });
          }
          const releaseAmount = item.quantity * Math.abs(qtyDifference);

          await prisma.flavorInventory.update({
            where: { flavorId: item.flavor.id },
            data: {
              reserved: Math.max(0, inventory.reserved - releaseAmount),
            },
          });
        }
      }
    }

    // Update cart line
    const updatedCartLine = await prisma.cartLine.update({
      where: { id: cartLineId },
      data: { quantity: newQty },
      include: {
        packRecipe: {
          include: {
            items: {
              include: {
                flavor: true,
              },
            },
          },
        },
      },
    });

    res.json({
      message: "Cart line updated successfully",
      cartLine: {
        id: updatedCartLine.id,
        product_id: updatedCartLine.productId,
        recipe_id: updatedCartLine.recipeId,
        recipe_title: updatedCartLine.packRecipe?.title || "Custom Pack",
        quantity: updatedCartLine.quantity,
        unit_price: updatedCartLine.unitPrice,
        total: updatedCartLine.quantity * updatedCartLine.unitPrice,
        sku: updatedCartLine.sku,
      },
    });
  } catch (error) {
    console.error("Error updating cart line:", error);
    res.status(500).json({ message: "Error updating cart line" });
  }
};

// Remove cart line
export const removeCartLine = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const guestId = (req as any).guestId;
    const isGuest = (req as any).isGuest;
    const cartLineId = req.params.id;

    // Get user or guest identifier
    const userIdentifier = isGuest ? { guestId } : { userId: user?.id };

    // Find the cart line
    const cartLine = await prisma.cartLine.findFirst({
      where: {
        id: cartLineId,
        ...userIdentifier,
      },
      include: {
        packRecipe: {
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
        },
      },
    });

    if (!cartLine) {
      return res.status(404).json({ message: "Cart line not found" });
    }

    // Release reserved inventory

    if (cartLine.packRecipe) {
      //Handle predefined recipes
      for (const item of cartLine.packRecipe.items) {
        const inventory = item.flavor.inventory;
        if (!inventory) {
          return res.status(400).json({
            message: `No inventory found for flavor : ${item.flavor.name}`,
          });
        }

        const releaseAmount = item.quantity * cartLine.quantity;

        await prisma.flavorInventory.update({
          where: { flavorId: item.flavor.id },
          data: { reserved: Math.max(0, inventory.reserved - releaseAmount) },
        });
      }
    } else if (cartLine.flavorIds.length > 0) {
      //handle custom packs
      const flavors = await prisma.flavor.findMany({
        where: { id: { in: cartLine.flavorIds } },
        include: { inventory: true },
      });
      for (const flavor of flavors) {
        const inventory = flavor.inventory;
        if (!inventory) {
          continue;
        }

        await prisma.flavorInventory.update({
          where: { flavorId: flavor.id },
          data: {
            reserved: Math.max(0, inventory.reserved - cartLine.quantity),
          },
        });
      }
    }

    // if (cartLine.packRecipe) {
    //   for (const item of cartLine.packRecipe.items) {
    //     const inventory = item.flavor.inventory;
    //     if (!inventory) {
    //       return res.status(400).json({
    //         message: `No inventory found for flavor: ${item.flavor.name}`,
    //       });
    //     }
    //     const releaseAmount = item.quantity * cartLine.quantity;

    //     await prisma.flavorInventory.update({
    //       where: { flavorId: item.flavor.id },
    //       data: {
    //         reserved: Math.max(0, inventory.reserved - releaseAmount),
    //       },
    //     });
    //   }
    // }

    // Delete cart line
    await prisma.cartLine.delete({
      where: { id: cartLineId },
    });

    res.json({ message: "Cart line removed successfully" });
  } catch (error) {
    console.error("Error removing cart line:", error);
    res.status(500).json({ message: "Error removing cart line" });
  }
};

// Clear entire cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const guestId = (req as any).guestId;
    const isGuest = (req as any).isGuest;

    // Get user or guest identifier
    const userIdentifier = isGuest ? { guestId } : { userId: user?.id };

    // Get all cart lines for the user
    const cartLines = await prisma.cartLine.findMany({
      where: userIdentifier,
      include: {
        packRecipe: {
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
        },
      },
    });

    // Release all reserved inventory
    for (const cartLine of cartLines) {
      if (cartLine.packRecipe) {
        // Handle predefined recipes
        for (const item of cartLine.packRecipe.items) {
          const inventory = item.flavor.inventory;
          if (!inventory) {
            continue; // Skip if no inventory found
          }
          const releaseAmount = item.quantity * cartLine.quantity;

          await prisma.flavorInventory.update({
            where: { flavorId: item.flavor.id },
            data: {
              reserved: Math.max(0, inventory.reserved - releaseAmount),
            },
          });
        }
      } else if (cartLine.flavorIds.length > 0) {
        // Handle custom packs
        const flavors = await prisma.flavor.findMany({
          where: { id: { in: cartLine.flavorIds } },
          include: { inventory: true },
        });

        for (const flavor of flavors) {
          const inventory = flavor.inventory;
          if (!inventory) {
            console.warn(
              `No inventory found for custom pack flavor: ${flavor.name}`
            );
            continue;
          }

          await prisma.flavorInventory.update({
            where: { flavorId: flavor.id },
            data: {
              reserved: Math.max(0, inventory.reserved - cartLine.quantity),
            },
          });
        }
      }
    }

    // Delete all cart lines
    await prisma.cartLine.deleteMany({
      where: userIdentifier,
    });

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Error clearing cart" });
  }
};
