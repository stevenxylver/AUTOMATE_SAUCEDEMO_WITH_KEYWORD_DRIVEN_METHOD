/**
 * Input keyword handler
 * Handles input actions for form fields in the application
 */

import { getPage } from "./login";
import { Environment } from "../utils/env";

/**
 * Enters text into an input field in the application
 * @param env Environment configuration
 * @param selector The selector for the input element
 * @param value The value to enter into the input field
 * @param options Optional fill options
 */

export async function input(
  env: Environment,
  selector: string,
  value: string,
  options?: string
): Promise<void> {
  const page = getPage();

  if (!page) {
    throw new Error(
      "No active browser session. Please use LOGIN keyword first."
    );
  }

  // Parse options if provided
  let fillOptions = {};
  if (options) {
    try {
      fillOptions = JSON.parse(options);
    } catch (error) {
      console.warn(
        `Invalid fill options format: ${options}. Using default options.`
      );
    }
  }

  // Wait for the element to be visible
  await page.waitForSelector(selector, {
    state: "visible",
    timeout: env.timeout,
  });

  // Clear the field first (optional based on needs)
  await page.fill(selector, "");

  // Fill the input field with the provided value
  await page.fill(selector, value, fillOptions);

  console.log(`Entered text into element: ${selector}, value: ${value}`);
}
