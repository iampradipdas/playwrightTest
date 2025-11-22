import { test, expect } from "../../utils/auth.setup";
import { getData } from "../../utils/storage";

test("FTO and Bill Search Test", async ({ pageWithToken }) => {
    const page = pageWithToken;

    const jitReferenceNo = getData("jitReferenceNo");
    const billNumber = getData("billNumber");

    await test.step("Navigate to Bill / FTO Search page", async () => {
        await page.getByText('JIT-Billing').click();
        await page.getByRole('link', { name: 'Bill/FTO Search' }).click();
    });

    await test.step("FTO Search → Enter FTO number and search", async () => {
        await page.getByRole('radio', { name: 'FTO' }).click();
        await page.getByRole('textbox', { name: 'Enter FTO Number' }).fill(jitReferenceNo);
        await page.waitForTimeout(1000);
        await page.locator('button span.pi-search').click();
    });

    await test.step("Validate FTO Search result", async () => {
        await expect(page.locator('b')).toContainText('Bill Details');
    });

    await test.step("Bill Search → Enter Bill Number and search", async () => {
        await page.getByRole('radio', { name: 'Bill' }).click();
        await page.getByRole('textbox', { name: 'Enter Bill No.' }).fill(billNumber);
        await page.waitForTimeout(1000);
        await page.locator('button span.pi-search').click();
    });

    await test.step("Validate Bill Search result", async () => {
        await expect(page.locator('jitbilling-bill-fto-search')).toContainText('Bill Details');
    });
});