/**
 * Click keyword handler
 * Handles click actions on elements in the application
 */

import { getPage } from './login';
import { Environment } from '../utils/env';

/**
 * Clicks on an element in the application
 * @param env Environment configuration
 * @param selector The selector for the element to click
 * @param options Optional click options (e.g., 'force: true')
 */
export async function click(env: Environment, selector: string, options?: string): Promise<void> {
  const page = getPage();
  
  if (!page) {
    throw new Error('No active browser session. Please use LOGIN keyword first.');
  }
  
  // Parse options if provided
  let clickOptions = {};
  if (options) {
    try {
      clickOptions = JSON.parse(options);
    } catch (error) {
      console.warn(`Invalid click options format: ${options}. Using default options.`);
    }
  }
  
  // Wait for the element to be visible
  await page.waitForSelector(selector, { state: 'visible', timeout: env.timeout });
  
  // Click the element
  await page.click(selector, clickOptions);
  
  console.log(`Clicked element: ${selector}`);
}