import type { TestInfo } from '@playwright/test';
import type { APIResponse } from '@playwright/test';

export async function attachApiStatus(testInfo: TestInfo, response: APIResponse) {
  try {
    // attach HTTP status
    const status = response.status();
    await testInfo.attach('api-status', {
      body: Buffer.from(String(status)),
      contentType: 'text/plain',
    });

    // attach response body
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
    // do not fail tests if attach fails
  }
}

export default attachApiStatus;
