import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");
  });

  test("should navigate to login page", async ({ page }) => {
    // Click login button/link
    await page.click("text=Login");

    // Verify we're on the login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
    await expect(page.locator("h1")).toContainText("Login");
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await page.goto("/auth/login");

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check for validation messages
    await expect(page.locator("text=Please fill in all fields")).toBeVisible();
  });

  test("should navigate to register page from login", async ({ page }) => {
    await page.goto("/auth/login");

    // Click register link
    await page.click("text=Register");

    // Verify we're on the register page
    await expect(page).toHaveURL(/.*\/auth\/register/);
    await expect(page.locator("h1")).toContainText("Register");
  });

  test("should show error for invalid login credentials", async ({ page }) => {
    await page.goto("/auth/login");

    // Fill in invalid credentials
    await page.fill('input[name="email"]', "invalid@example.com");
    await page.fill('input[name="password"]', "wrongpassword");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator("text=Invalid credentials")).toBeVisible();
  });

  test("should navigate to forgot password page", async ({ page }) => {
    await page.goto("/auth/login");

    // Click forgot password link
    await page.click("text=Forgot Password");

    // Verify we're on the forgot password page
    await expect(page).toHaveURL(/.*\/auth\/forgot-password/);
    await expect(page.locator("h1")).toContainText("Forgot Password");
  });
});

test.describe("Registration Flow", () => {
  test("should show validation errors for invalid registration", async ({
    page,
  }) => {
    await page.goto("/auth/register");

    // Fill in invalid email
    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "123"); // too short

    // Submit form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator("text=Please enter a valid email")).toBeVisible();
  });

  test("should show password strength requirements", async ({ page }) => {
    await page.goto("/auth/register");

    // Focus on password field
    await page.focus('input[name="password"]');

    // Type weak password
    await page.fill('input[name="password"]', "weak");

    // Should show password requirements
    await expect(page.locator("text=Password must be at least")).toBeVisible();
  });
});
