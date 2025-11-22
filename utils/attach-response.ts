import type { TestInfo } from '@playwright/test';
import type { APIResponse } from '@playwright/test';

export async function attachApiStatus(testInfo: TestInfo, response: APIResponse) {
  try {
    const status = response.status();
    await testInfo.attach('api-status', {
      body: Buffer.from(String(status)),
      contentType: 'text/plain',
    });

    // attach response body (optional, small bodies only)
    try {
      const text = await response.text();
      await testInfo.attach('api-response', {
        body: Buffer.from(text),
        contentType: 'application/json',
      });
    } catch (e) {
      // ignore body attach errors
    }
  } catch (e) {
    // best-effort attach; do not fail tests if attach fails
  }
}

export default attachApiStatus;
