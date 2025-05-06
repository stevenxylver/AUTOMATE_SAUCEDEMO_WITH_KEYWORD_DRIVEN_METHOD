/**
 * Navigate keyword handler
 * Handles navigation functionality for the application
 */

import { getPage } from './login';
import { Environment } from '../utils/env';

/**
 * Navigates to a specific URL in the application
 * @param env Environment configuration
 * @param path The path to navigate to (will be appended to baseUrl)
 */
export async function navigate(env: Environment, path: string): Promise<void> {
  const page = getPage();
  
  if (!page) {
    throw new Error('No active browser session. Please use LOGIN keyword first.');
  }
  
  // If path is a full URL, use it directly; otherwise, append to baseUrl
  const url = path.startsWith('http') ? path : `${env.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  
  // Navigate to the URL
  await page.goto(url);
  
  // Wait for navigation to complete
  await page.waitForLoadState('networkidle');
  
  console.log(`Navigated to: ${url}`);
}