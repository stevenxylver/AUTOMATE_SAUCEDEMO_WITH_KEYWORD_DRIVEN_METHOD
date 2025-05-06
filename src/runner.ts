import * as xlsx from "xlsx";
import * as path from "path";
import * as fs from "fs";
import { test, Page, Browser } from "@playwright/test";
import { allure } from "allure-playwright";

// Import all keyword handlers
import { login } from "./keywords/login";
import { navigate } from "./keywords/navigate";
import { click } from "./keywords/click";
import { input } from "./keywords/input";
import { verify } from "./keywords/verify";
import { screenshot } from "./keywords/screenshot";

// Environment setup
import { loadEnvironment } from "./utils/env";

// Map of keyword names to their handler functions
const keywordHandlers: Record<string, Function> = {
  LOGIN: login,
  NAVIGATE: navigate,
  CLICK: click,
  INPUT: input,
  VERIFY: verify,
  SCREENSHOT: screenshot,
};

/**
 * Processes a parameter value, handling special cases and environment variables
 * @param param The parameter value to process
 * @param env The environment configuration
 * @returns The processed parameter value
 */
function processParameter(param: any, env: any): any {
  if (typeof param !== "string") return param;

  // Handle empty or undefined values
  if (!param || param === "undefined" || param === "null") {
    return null;
  }

  // Handle environment variable references with $
  if (param.startsWith("$") && param.length > 1) {
    const envKey = param.substring(1);
    if (env[envKey] !== undefined) {
      console.log(`Using environment variable for ${envKey}`);
      return env[envKey];
    }
    console.log(
      `Environment variable ${envKey} not found, using as literal string`
    );
    return param;
  }

  // Handle boolean values
  if (param.toLowerCase() === "true") return true;
  if (param.toLowerCase() === "false") return false;

  // Handle numeric values
  if (!isNaN(Number(param))) return Number(param);

  // Handle special characters in strings
  if (
    param.includes("$") ||
    param.includes("*") ||
    param.includes("+") ||
    param.includes("?") ||
    param.includes("[") ||
    param.includes("]") ||
    param.includes("-") ||
    param.includes("_") ||
    param.includes("(") ||
    param.includes(")")
  ) {
    console.log(`Parameter contains special characters: ${param}`);
    return param;
  }

  return param;
}

/**
 * Attaches video to Allure report if it exists
 * @param testName Name of the test case
 */
async function attachVideoToReport(testName: string) {
  const possibleVideoPaths = [
    path.join(process.cwd(), "test-results", `${testName}.webm`),
    path.join(process.cwd(), "test-results", `${testName}-retry0.webm`),
    path.join(process.cwd(), "test-results", `${testName}-retry1.webm`),
    // Add paths for test-specific directories
    ...fs
      .readdirSync(path.join(process.cwd(), "test-results"))
      .filter(
        (dir) =>
          dir.includes(testName) &&
          fs
            .statSync(path.join(process.cwd(), "test-results", dir))
            .isDirectory()
      )
      .map((dir) =>
        path.join(process.cwd(), "test-results", dir, "video.webm")
      ),
  ];

  for (const videoPath of possibleVideoPaths) {
    if (fs.existsSync(videoPath)) {
      try {
        await allure.attachment(
          "Test Video",
          fs.readFileSync(videoPath),
          "video/webm"
        );
        console.log(`Successfully attached video from: ${videoPath}`);
        // Don't delete the video file as it might be needed for the final report
      } catch (error) {
        console.error(`Failed to attach video from ${videoPath}:`, error);
      }
    }
  }
}

/**
 * Runs a single test row from the Excel file
 * @param env Environment configuration
 * @param headers Array of column headers from Excel
 * @param row Array of values from the current row
 * @param page Playwright Page object
 * @param browser Playwright Browser object
 * @returns Object containing success status and any error
 */
export async function runTestRow(
  env: any,
  headers: string[],
  row: any[],
  page: Page,
  browser: Browser
): Promise<{ success: boolean; error?: any }> {
  const testName = `Test_${row[0]}_${Date.now()}`;

  try {
    const keyword = String(row[0]).trim().toUpperCase();
    const params = row.slice(1).filter((param) => param !== undefined);

    // Process parameters with special symbols
    const processedParams = params.map((param) => processParameter(param, env));

    // Add parameter details to report with better formatting
    await allure.step("Test Parameters", async () => {
      for (let j = 0; j < processedParams.length; j++) {
        if (headers[j + 1]) {
          const paramName = headers[j + 1].trim();
          const paramValue = processedParams[j];

          // Format parameter value for display
          let displayValue = paramValue;
          if (paramValue === null) displayValue = "null";
          if (paramValue === undefined) displayValue = "undefined";
          if (typeof paramValue === "boolean")
            displayValue = paramValue.toString();

          await allure.parameter(paramName, String(displayValue));
        }
      }
    });

    // Execute the keyword handler if it exists
    if (keywordHandlers[keyword]) {
      try {
        await keywordHandlers[keyword](page, browser, processedParams);
        await attachVideoToReport(testName);
        return { success: true };
      } catch (error) {
        console.error(`Error executing keyword ${keyword}:`, error);
        await attachVideoToReport(testName);
        return {
          success: false,
          error: `Keyword execution failed: ${String(error)}`,
        };
      }
    } else {
      const error = `Unknown keyword: ${keyword}`;
      console.warn(error);
      return { success: false, error };
    }
  } catch (error) {
    console.error(`Error executing test row:`, error);
    await attachVideoToReport(testName);
    return {
      success: false,
      error: `Test execution failed: ${String(error)}`,
    };
  }
}
