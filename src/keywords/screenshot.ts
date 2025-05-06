/**
 * Screenshot keyword handler
 * Handles taking screenshots during test execution
 */

import * as path from 'path';
import * as fs from 'fs';
import { getPage } from './login';
import { Environment } from '../utils/env';

/**
 * Takes a screenshot of the current page state
 * @param env Environment configuration
 * @param name Optional name for the screenshot file (defaults to timestamp)
 * @param fullPage Optional flag to take a full page screenshot (defaults to true)
 */
export async function screenshot(env: Environment, name?: string, fullPage: string = 'true'): Promise<void> {
  const page = getPage();
  
  if (!page) {
    throw new Error('No active browser session. Please use LOGIN keyword first.');
  }
  
  // Create screenshots directory if it doesn't exist
  const screenshotDir = path.resolve(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  // Generate filename based on provided name or timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = name ? `${name}.png` : `screenshot-${timestamp}.png`;
  const filePath = path.join(screenshotDir, fileName);
  
  // Take the screenshot
  const isFullPage = fullPage.toLowerCase() === 'true';
  await page.screenshot({ path: filePath, fullPage: isFullPage });
  
  console.log(`Screenshot saved to: ${filePath}`);
}