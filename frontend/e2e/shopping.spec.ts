import { test, expect } from "@playwright/test";

test.describe("Shopping Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should navigate to shop page", async ({ page }) => {
    // Click shop link
    await page.click("text=Shop");

    // Verify we're on the shop page
    await expect(page).toHaveURL(/.*\/shop/);
    await expect(page.locator("h1")).toContainText("Shop");
  });

  test("should display products in shop", async ({ page }) => {
    await page.goto("/shop");

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    });

    // Check if products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCount.greaterThan(0);
  });

  test("should navigate to product detail page", async ({ page }) => {
    await page.goto("/shop");

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    });

    // Click on first product
    await page.click('[data-testid="product-card"]:first-child');

    // Should navigate to product detail page
    await expect(page).toHaveURL(/.*\/products\/[^/]+/);
  });

  test("should add product to cart (requires login)", async ({ page }) => {
    await page.goto("/shop");

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    });

    // Click on first product
    await page.click('[data-testid="product-card"]:first-child');

    // Try to add to cart
    await page.click('button:has-text("Add to Cart")');

    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test("should navigate to cart page", async ({ page }) => {
    // Click cart icon
    await page.click('[data-testid="cart-icon"]');

    // Should navigate to cart page
    await expect(page).toHaveURL(/.*\/cart/);
  });

  test("should show empty cart message", async ({ page }) => {
    await page.goto("/cart");

    // Should show empty cart message
    await expect(page.locator("text=Your cart is empty")).toBeVisible();
  });
});

test.describe("Product Search and Filtering", () => {
  test("should search for products", async ({ page }) => {
    await page.goto("/shop");

    // Wait for search input
    await page.waitForSelector('input[placeholder*="Search"]', {
      timeout: 5000,
    });

    // Type in search box
    await page.fill('input[placeholder*="Search"]', "chocolate");

    // Press enter or click search
    await page.press('input[placeholder*="Search"]', "Enter");

    // Should show filtered results
    await page.waitForTimeout(1000); // Wait for search results
  });

  test("should filter products by category", async ({ page }) => {
    await page.goto("/shop");

    // Wait for category filters
    await page.waitForSelector('[data-testid="category-filter"]', {
      timeout: 5000,
    });

    // Click on a category
    await page.click('[data-testid="category-filter"]:first-child');

    // Should show filtered results
    await page.waitForTimeout(1000); // Wait for filter results
  });
});
