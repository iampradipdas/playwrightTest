import { test as base, Page } from "@playwright/test";

// Extend the test type
export const test = base.extend<{pageWithToken: Page;}>
({
  pageWithToken: async ({ page }, use) => {
    const token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXBwcm92ZXIiLCJyb2xlSWQiOiIyNjQiLCJwZXJtaXNzaW9ucyI6IltcImNhbi12aWV3LWZ0b1wiLFwiY2FuLXJlamVjdC1mdG8tYWZ0ZXItYmlsbC1nZW5lcmF0ZWRcIixcImNhbi1yZWplY3QtZnRvLWJlZm9yZS1iaWxsLWdlbmVyYXRlZFwiLFwiY2FuLWFwcHJvdmUtYWdlbmN5LWRkby1tYXBcIixcImNhbi12aWV3LWhvYS1kZXRhaWxcIixcImNhbi1jaGVjay1hbGxvdG1lbnRcIixcImNhbi1mb3J3YXJkLWJpbGwtYXBwcm92ZXJcIixcImNhbi1mb3J3YXJkLWJpbGwtdHJlYXN1cnlcIixcImNhbi1yZWdlbmVyYXRlLWNwaW4tZmFpbGVkXCIsXCJjYW4tdmlldy1yZXBvcnRcIixcImNhbi12aWV3LW1hc3Rlci1yZWNvcmRzXCIsXCJjYW4tdmlldy1qaXQtcmVwb3J0XCIsXCJjYW4tY3JlYXRlLWJpbGxcIixcImNhbi12aWV3LWppdC1iaWxsXCIsXCJjYW4tcmVqZWN0LWZ0b1wiLFwiY2FuLXZpZXctc3VjY2Vzc2Z1bC1iZW5mLWxpc3RcIixcImNhbi12aWV3LWZhaWxlZC1iZW5mLWxpc3RcIixcImNhbi11cGRhdGUtZWNzLWNhbmNlbGxhdGlvblwiLFwiY2FuLXZpZXctdHJhbnNhY3Rpb24tc3VtbWFyeVwiXSIsImxldmVsIjoiRERPIiwibGV2ZWxJZCI6IjE1NiIsInNjb3BlIjoiTUlFUFJBMDA4Iiwic2NvcGVJZCI6IjI1MTM1NCIsIm5hbWVpZCI6IjMyMzM2IiwiZW1haWwiOiJtYW53YXJAZ21haWwuY29tIiwibmFtZSI6Ik1hbndhciBIb3NzYWluIiwiY3JlYXRlZF9ieSI6IjE0IiwiZGVzaWduYXRpb24iOiJEZXZlbG9wZXIiLCJ0eXAiOiJhY2MiLCJwdGkiOiIxMTI4NSIsImFpZCI6IjYzIiwianRpIjoiMTEyODYiLCJpYXQiOjE3NDg5NDEzOTksIm5iZiI6MTc0ODk0MTM5OSwiZXhwIjoxNzUzOTQxNjk5LCJpc3MiOiJXQklGTVNfVVNFUk1BTkFHRU1FTlQiLCJhdWQiOiJXQklGTVNfTU9EVUxFUyJ9.l1KaImYUOfVZK5p4ES9tc9agWNfsZAVFPj55nB7T6F0xZYMO7c5FPkik7Ksna4_0NpPcCoh2OH479iTAjJfFAw";

    // Inject token before any page load
    await page.addInitScript((token) => {
      localStorage.setItem("WBJITBilling-jwtToken", token);
    }, token);

    // Go to dashboard after token is set
    await page.goto("http://localhost:4200/dashboard");

    // Provide the page with token to tests
    await use(page);
  },
});
export { expect } from "@playwright/test";



