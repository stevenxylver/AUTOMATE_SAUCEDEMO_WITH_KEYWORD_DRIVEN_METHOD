/**
 * Verify keyword handler
 * Handles verification of elements and conditions in the application
 */

import { getPage } from './login';
import { Environment } from '../utils/env';

/**
 * Verifies that an element exists in the application
 * @param env Environment configuration
 * @param selector The selector for the element to verify
 * @param expectedState Optional expected state ('visible', 'hidden', 'enabled', 'disabled')
 * @param timeout Optional timeout in milliseconds
 */
export async function verify(env: Environment, selector: string, expectedState: string = 'visible', timeout?: string): Promise<void> {
  const page = getPage();
  
  if (!page) {
    throw new Error('No active browser session. Please use LOGIN keyword first.');
  }
  
  // Parse timeout if provided
  const timeoutMs = timeout ? parseInt(timeout, 10) : env.timeout;
  
  // Determine the verification method based on the expected state
  switch (expectedState.toLowerCase()) {
    case 'visible':
      await page.waitForSelector(selector, { state: 'visible', timeout: timeoutMs });
      console.log(`Verified element is visible: ${selector}`);
      break;
    case 'hidden':
      await page.waitForSelector(selector, { state: 'hidden', timeout: timeoutMs });
      console.log(`Verified element is hidden: ${selector}`);
      break;
    case 'enabled':
      await page.waitForSelector(selector, { state: 'visible', timeout: timeoutMs });
      const isDisabled = await page.getAttribute(selector, 'disabled');
      if (isDisabled) {
        throw new Error(`Element ${selector} is disabled, expected to be enabled`);
      }
      console.log(`Verified element is enabled: ${selector}`);
      break;
    case 'disabled':
      await page.waitForSelector(selector, { state: 'visible', timeout: timeoutMs });
      const isEnabled = await page.getAttribute(selector, 'disabled');
      if (!isEnabled) {
        throw new Error(`Element ${selector} is enabled, expected to be disabled`);
      }
      console.log(`Verified element is disabled: ${selector}`);
      break;
    case 'contains':
      // This case requires an additional parameter for the text to check
      // This would be handled in a more complex implementation
      throw new Error('The "contains" verification requires additional parameters');
    default:
      throw new Error(`Unknown verification state: ${expectedState}`);
  }
}

/**
 * Verifies that text exists on the page
 * @param env Environment configuration
 * @param text The text to verify
 * @param timeout Optional timeout in milliseconds
 */
export async function verifyText(env: Environment, text: string, timeout?: string): Promise<void> {
  const page = getPage();
  
  if (!page) {
    throw new Error('No active browser session. Please use LOGIN keyword first.');
  }
  
  // Parse timeout if provided
  const timeoutMs = timeout ? parseInt(timeout, 10) : env.timeout;
  
  // Wait for the text to be visible on the page
  await page.waitForSelector(`text=${text}`, { timeout: timeoutMs });
  
  console.log(`Verified text exists on page: "${text}"`);
}