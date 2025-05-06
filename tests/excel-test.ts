import { test } from "@playwright/test";
import * as xlsx from "xlsx";
import * as path from "path";
import * as fs from "fs";
import { allure } from "allure-playwright";
import { loadEnvironment } from "../src/utils/env";
import { runTestRow } from "../src/runner";

// Load environment and Excel file
const excelFilePath = path.resolve(__dirname, "../test-data/test-cases.xlsx");
const env = loadEnvironment("dev");

// Read Excel file
const workbook = xlsx.readFile(excelFilePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json<string[]>(sheet, { header: 1 });
const headers = rows[0] as string[];

// Create a test for each row
for (let i = 1; i < rows.length; i++) {
  const row = rows[i] as any[];
  if (!row || row.length === 0 || !row[0]) continue;

  // Extract test case name and description from row
  const keyword = String(row[0]).trim().toUpperCase();
  const testCaseName = row[1] || `Test Case ${i}`; // Use second column as test case name if available
  const testCaseDescription = row[2] || `Executing ${keyword} keyword`; // Use third column as description if available

  test(`TC${i}: ${testCaseName}`, async ({ page, browser }) => {
    // Add test details to Allure report
    await allure.epic("Keyword-Driven Testing");
    await allure.feature("Excel-based Test Execution");
    await allure.story(`Test Suite ${Math.floor(i / 10) + 1}`); // Group tests into suites of 10
    await allure.description(testCaseDescription);
    await allure.severity("normal");

    // Add test case metadata
    await allure.parameter("Test Case ID", `TC${i}`);
    await allure.parameter("Keyword", keyword);
    await allure.parameter("Environment", env.name || "dev");

    // Add start time
    const startTime = new Date();
    await allure.parameter("Start Time", startTime.toISOString());

    try {
      // Execute the test row
      const result = await runTestRow(env, headers, row, page, browser);

      if (!result.success) {
        throw result.error;
      }

      // Add success attachment with execution time
      const endTime = new Date();
      const executionTime = (endTime.getTime() - startTime.getTime()) / 1000;
      await allure.attachment(
        `test-case-${i}-success`,
        `Test case executed successfully in ${executionTime} seconds`,
        "text/plain"
      );

      // Add test case status
      await allure.step("Test Case Status", async () => {
        await allure.parameter("Status", "PASSED");
        await allure.parameter("Execution Time", `${executionTime} seconds`);
      });
    } catch (error) {
      // Add error attachment with execution time
      const endTime = new Date();
      const executionTime = (endTime.getTime() - startTime.getTime()) / 1000;
      await allure.attachment(
        `test-case-${i}-error`,
        `Test case failed after ${executionTime} seconds\nError: ${String(
          error
        )}`,
        "text/plain"
      );

      // Add test case status
      await allure.step("Test Case Status", async () => {
        await allure.parameter("Status", "FAILED");
        await allure.parameter("Execution Time", `${executionTime} seconds`);
        await allure.parameter("Error Message", String(error));
      });

      throw error;
    } finally {
      // Add final test case summary
      await allure.step("Test Case Summary", async () => {
        const endTime = new Date();
        const executionTime = (endTime.getTime() - startTime.getTime()) / 1000;
        await allure.parameter(
          "Total Execution Time",
          `${executionTime} seconds`
        );
        await allure.parameter("Browser", "Chrome");
        await allure.parameter("Resolution", "1280x720");
      });
    }
  });
}
