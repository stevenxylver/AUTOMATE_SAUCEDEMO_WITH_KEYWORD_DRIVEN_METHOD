# Test Data Directory

This directory contains Excel files with test cases for the Keyword Driven Testing framework.

## Excel File Format

The Excel files should follow this format:

- First column: Keywords (e.g., LOGIN, NAVIGATE, CLICK, INPUT, VERIFY, SCREENSHOT)
- Subsequent columns: Parameters for the keywords

### Example Structure:

| Keyword    | Param 1              | Param 2     | Param 3 |
| ---------- | -------------------- | ----------- | ------- |
| LOGIN      | (uses default creds) |             |         |
| NAVIGATE   | /dashboard           |             |         |
| VERIFY     | .dashboard-title     | visible     | 5000    |
| CLICK      | #user-profile-button |             |         |
| INPUT      | input[name="search"] | search term |         |
| SCREENSHOT | search-results       | true        |         |

## Available Keywords

- **LOGIN**: Logs into the application

  - Parameters: [username], [password] (optional, uses environment defaults if not provided)

- **NAVIGATE**: Navigates to a specific URL

  - Parameters: path (will be appended to baseUrl unless it's a full URL)

- **CLICK**: Clicks on an element

  - Parameters: selector, [options] (optional JSON string with click options)

- **INPUT**: Enters text into an input field

  - Parameters: selector, value, [options] (optional JSON string with fill options)

- **VERIFY**: Verifies an element's state

  - Parameters: selector, [expectedState] (visible, hidden, enabled, disabled), [timeout]

- **SCREENSHOT**: Takes a screenshot
  - Parameters: [name], [fullPage] (true/false)

Create your Excel files based on this structure and place them in this directory to use with the test runner.
