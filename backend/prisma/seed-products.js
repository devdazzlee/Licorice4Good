"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../src/generated/prisma");
const prisma = new prisma_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🌱 Seeding Minimal Product Data (Database-Driven System)...\n");
        // Create minimal flavors - admin can add more through admin interface
        const flavors = [
            { id: "red_twist", name: "Red Twist", aliases: [], active: true },
            { id: "blue_raspberry", name: "Blue Raspberry", aliases: [], active: true },
            {
                id: "green_apple",
                name: "Green Apple",
                aliases: ["Apple"],
                active: true,
            },
        ];
        // Ensure all flavors exist
        for (const flavor of flavors) {
            yield prisma.flavor.upsert({
                where: { id: flavor.id },
                update: flavor,
                create: flavor,
            });
        }
        // Ensure inventory exists for minimal flavors
        const inventory = [
            { flavorId: "red_twist", onHand: 100, reserved: 0, safetyStock: 5 },
            { flavorId: "blue_raspberry", onHand: 100, reserved: 0, safetyStock: 5 },
            { flavorId: "green_apple", onHand: 100, reserved: 0, safetyStock: 5 },
        ];
        for (const inv of inventory) {
            yield prisma.flavorInventory.upsert({
                where: { flavorId: inv.flavorId },
                update: inv,
                create: inv,
            });
        }
        // Clear existing products - admin will create products through admin interface
        yield prisma.product.deleteMany({});
        // Create minimal example products - admin can add more through admin interface
        const exampleProducts = [
            {
                id: "traditional-3-red-twist",
                name: "Traditional - 3 Red Twist",
                description: "Classic combination of 3 Red Twist candies in one pack",
                price: 27.0,
                stock: 50,
                category: "Traditional",
                sku: "3P-TRA-REDx3",
                flavors: [{ flavorId: "red_twist", quantity: 3 }],
            },
            {
                id: "sour-mixed-flavors",
                name: "Sour - Mixed Flavors",
                description: "Tangy mix of Blue Raspberry and Green Apple",
                price: 27.0,
                stock: 45,
                category: "Sour",
                sku: "3P-SOU-BLU-GRE",
                flavors: [
                    { flavorId: "blue_raspberry", quantity: 1 },
                    { flavorId: "green_apple", quantity: 2 },
                ],
            },
        ];
        const products = exampleProducts;
        console.log("Creating 3-pack and 5-pack products...");
        for (const productData of products) {
            const { flavors: productFlavors } = productData, product = __rest(productData, ["flavors"]);
            // Create the product
            const createdProduct = yield prisma.product.create({
                data: product,
            });
            // Create the product-flavor relationships
            for (const flavor of productFlavors) {
                yield prisma.productFlavor.create({
                    data: {
                        productId: createdProduct.id,
                        flavorId: flavor.flavorId,
                        quantity: flavor.quantity,
                    },
                });
            }
            console.log(`✅ Created: ${product.name} (${product.sku})`);
        }
        console.log("\n🎉 Successfully seeded minimal product data!");
        console.log("📊 Summary:");
        console.log(`   - Flavors: ${flavors.length} flavors (admin can add more)`);
        console.log(`   - Example Products: ${products.length} products (admin can add more)`);
        console.log(`   - Categories: Traditional, Sour, Sweet (admin can add more)`);
        console.log("\n💡 Next Steps:");
        console.log("   1. Use admin interface to add more flavors");
        console.log("   2. Use admin interface to create more products");
        console.log("   3. Use admin interface to manage inventory");
        console.log("   4. System now supports dynamic SKU generation!");
    });
}
main()
    .catch((e) => {
    console.error("❌ Error seeding products:", e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
