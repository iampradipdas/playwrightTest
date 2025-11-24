import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 120000,
  expect: {
    timeout: 15000,
  },
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html'],
    ['./reporters/custom-excel-reporter.ts']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:7117',
    extraHTTPHeaders: {
    Authorization: `Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXBwcm92ZXIiLCJyb2xlSWQiOiIyNjQiLCJwZXJtaXNzaW9ucyI6IltcImNhbi12aWV3LWZ0b1wiLFwiY2FuLXJlamVjdC1mdG8tYWZ0ZXItYmlsbC1nZW5lcmF0ZWRcIixcImNhbi1yZWplY3QtZnRvLWJlZm9yZS1iaWxsLWdlbmVyYXRlZFwiLFwiY2FuLWFwcHJvdmUtYWdlbmN5LWRkby1tYXBcIixcImNhbi12aWV3LWhvYS1kZXRhaWxcIixcImNhbi1jaGVjay1hbGxvdG1lbnRcIixcImNhbi1mb3J3YXJkLWJpbGwtYXBwcm92ZXJcIixcImNhbi1mb3J3YXJkLWJpbGwtdHJlYXN1cnlcIixcImNhbi1yZWdlbmVyYXRlLWNwaW4tZmFpbGVkXCIsXCJjYW4tdmlldy1yZXBvcnRcIixcImNhbi12aWV3LW1hc3Rlci1yZWNvcmRzXCIsXCJjYW4tdmlldy1qaXQtcmVwb3J0XCIsXCJjYW4tY3JlYXRlLWJpbGxcIixcImNhbi12aWV3LWppdC1iaWxsXCIsXCJjYW4tcmVqZWN0LWZ0b1wiLFwiY2FuLXZpZXctc3VjY2Vzc2Z1bC1iZW5mLWxpc3RcIixcImNhbi12aWV3LWZhaWxlZC1iZW5mLWxpc3RcIixcImNhbi11cGRhdGUtZWNzLWNhbmNlbGxhdGlvblwiLFwiY2FuLXZpZXctdHJhbnNhY3Rpb24tc3VtbWFyeVwiXSIsImxldmVsIjoiRERPIiwibGV2ZWxJZCI6IjE1NiIsInNjb3BlIjoiTUlFUFJBMDA4Iiwic2NvcGVJZCI6IjI1MTM1NCIsIm5hbWVpZCI6IjMyMzM2IiwiZW1haWwiOiJtYW53YXJAZ21haWwuY29tIiwibmFtZSI6Ik1hbndhciBIb3NzYWluIiwiY3JlYXRlZF9ieSI6IjE0IiwiZGVzaWduYXRpb24iOiJEZXZlbG9wZXIiLCJ0eXAiOiJhY2MiLCJwdGkiOiIxMTI4NSIsImFpZCI6IjYzIiwianRpIjoiMTEyODYiLCJpYXQiOjE3NDg5NDEzOTksIm5iZiI6MTc0ODk0MTM5OSwiZXhwIjoxNzUzOTQxNjk5LCJpc3MiOiJXQklGTVNfVVNFUk1BTkFHRU1FTlQiLCJhdWQiOiJXQklGTVNfTU9EVUxFUyJ9.l1KaImYUOfVZK5p4ES9tc9agWNfsZAVFPj55nB7T6F0xZYMO7c5FPkik7Ksna4_0NpPcCoh2OH479iTAjJfFAw`,
    "Content-Type": "application/json"
  },
    screenshot: 'only-on-failure',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    headless: false,
    actionTimeout: 40000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
