/**
 * Login keyword handler
 * Handles login functionality for the application
 */

import { Page, Browser } from "@playwright/test";
import { allure } from "allure-playwright";
import * as fs from "fs";
import * as path from "path";
import { loadEnvironment } from "../utils/env";

let browser: Browser | null = null;
let page: Page | null = null;

/**
 * Takes a screenshot and attaches it to Allure report
 * @param name Name for the screenshot
 * @param page Playwright page instance
 */
async function takeScreenshot(name: string, page: Page) {
  try {
    const screenshotPath = path.join(
      process.cwd(),
      "test-results",
      `${name}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await allure.attachment(name, fs.readFileSync(screenshotPath), "image/png");
    // Clean up the screenshot file
    fs.unlinkSync(screenshotPath);
  } catch (error) {
    console.error(`Failed to take screenshot ${name}:`, error);
  }
}

/**
 * Performs login to the application
 * @param env Environment configuration
 * @param username Optional username (uses env.username if not provided)
 * @param password Optional password (uses env.password if not provided)
 */
export async function login(
  page: Page | null,
  browser: Browser | null,
  params: string[]
): Promise<void> {
  if (!page || !browser) {
    throw new Error("Page or browser instance is null");
  }

  const env = loadEnvironment(process.env.NODE_ENV || "dev");

  try {
    await allure.step("Starting Login Process", async () => {
      // Launch browser and navigate to login page
      await allure.step("Launching Browser", async () => {
        await page.goto("https://www.saucedemo.com/", {
          waitUntil: "networkidle",
          timeout: env.timeout || 30000,
        });
      });

      // Take screenshot after page load
      await allure.step("Taking Initial Screenshot", async () => {
        await page.screenshot({ path: "test-results/login-page.png" });
      });

      // Enter credentials
      await allure.step("Entering Login Credentials", async () => {
        const [username, password] = params;
        const loginUsername = username || env.username;
        const loginPassword = password || env.password;

        if (!loginUsername || !loginPassword) {
          throw new Error(
            "Login credentials not provided and not available in environment"
          );
        }

        // Wait for username field with retry
        let retryCount = 0;
        while (retryCount < 3) {
          try {
            await page.waitForSelector("#user-name", {
              timeout: env.timeout || 10000,
            });
            break;
          } catch (error) {
            retryCount++;
            if (retryCount === 3) throw error;
            await page.reload();
          }
        }

        await page.fill("#user-name", loginUsername);
        await page.fill("#password", loginPassword);
      });

      // Take screenshot after entering credentials
      await allure.step("Taking Credentials Screenshot", async () => {
        await page.screenshot({ path: "test-results/credentials-entered.png" });
      });

      // Submit login form
      await allure.step("Submitting Login Form", async () => {
        const loginButton = await page.waitForSelector("#login-button", {
          timeout: env.timeout || 10000,
        });
        await loginButton.click();
      });

      // Wait for navigation with retry
      await allure.step("Waiting for Navigation", async () => {
        let retryCount = 0;
        while (retryCount < 3) {
          try {
            // Wait for either inventory page or error message
            await Promise.race([
              page.waitForSelector(".inventory_container", {
                timeout: env.timeout || 10000,
              }),
              page.waitForSelector('[data-test="error"]', {
                timeout: env.timeout || 10000,
              }),
            ]);
            break;
          } catch (error) {
            retryCount++;
            if (retryCount === 3) throw error;
            await page.reload();
            // Re-enter credentials
            const [username, password] = params;
            const loginUsername = username || env.username;
            const loginPassword = password || env.password;

            if (!loginUsername || !loginPassword) {
              throw new Error(
                "Login credentials not provided and not available in environment"
              );
            }

            await page.fill("#user-name", loginUsername);
            await page.fill("#password", loginPassword);
            await page.click("#login-button");
          }
        }
      });

      // Take final screenshot
      await allure.step("Taking Final Screenshot", async () => {
        await page.screenshot({ path: "test-results/login-complete.png" });
      });
    });
  } catch (error) {
    // Take error screenshot
    await page.screenshot({ path: "test-results/login-error.png" });
    throw error;
  }
}

/**
 * Get the current page instance
 * @returns The current Playwright page instance
 */
export function getPage(): Page | null {
  return page;
}

/**
 * Get the current browser instance
 * @returns The current Playwright browser instance
 */
export function getBrowser(): Browser | null {
  return browser;
}
