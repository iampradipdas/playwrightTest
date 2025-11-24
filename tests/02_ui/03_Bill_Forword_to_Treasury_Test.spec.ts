import { test, expect } from "../../utils/auth.setup";
import { getData } from "../../utils/storage";

test("Bill Forward Test", async ({ pageWithToken }) => {
    const page = pageWithToken;
    await test.step("Navigate → JIT Billing → Generated JIT Bill", async () => {
        await page.getByText("JIT-Billing").click();
        await page.locator('a[href="/generated-jit-bill"]').click();
    });

    await test.step("Select filter → Bill No → Enter Bill Number", async () => {
        await page.locator('p-dropdown .p-dropdown').nth(1).click();
        await page.locator('.p-dropdown-item', { hasText: 'Bill No' }).click();
        await page.getByRole('textbox', { name: 'Enter to Search' }).fill(getData("billNumber"));
        await page.locator('button span.pi-search').click();
    });

    await test.step("Open Bill Details from table", async () => {
        await page.locator("table.p-datatable-table .pi-eye").first().click();
    });

    await test.step("Navigate Stepper → Bill → ECS → By Transfer", async () => {
        await page.locator('.p-stepper-panel', { hasText: 'Bill Details' })
            .locator('button:has-text("Next")')
            .click();

        await page.locator('.p-stepper-panel', { hasText: 'ECS Details' })
            .locator('button:has-text("Next")')
            .click();

        await page.locator('.p-stepper-panel', { hasText: 'By Transfer Details' })
            .locator('button:has-text("Next")')
            .click();
    });

    await test.step("Insert CPIN → Select CPIN Date → Enter CPIN → Select Vendor → Add", async () => {

        await page.getByRole("button", { name: "Insert CPIN" }).click();

        // Select CPIN Date
        await page.getByRole("combobox", { name: "Enter CPIN Date" }).click();
        await page.waitForTimeout(100);
        await page.locator('.p-datepicker-today, .today, [aria-current="date"]').click();

        // Enter CPIN Number
        const timestamp = Date.now().toString();
        const randomDigit = Math.floor(Math.random() * 10);
        const uniqueCPIN = timestamp + randomDigit;
        await page.getByPlaceholder("Enter CPIN Number.").fill(uniqueCPIN);

        // Select Vendor options
        await page.getByRole("combobox", { name: "Select Vendor" }).click();
        let items = page.locator('li[role="option"]');
        await items.first().waitFor({ state: "visible" });

        const count = await items.count();
        for (let i = 0; i < count; i++) {
            if (i !== 0) {
                await page.getByRole("combobox", { name: "Select Vendor" }).click();
                items = page.locator('li[role="option"]');
                await items.first().waitFor({ state: "visible" });
            }
            await page.waitForTimeout(800);
            await items.nth(i).click();
            await page.waitForTimeout(500);

            await page.waitForTimeout(800);
            await page.getByRole("button", { name: "Add" }).click();
        }

        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('button', { name: 'OK' }).click();
    });

    await test.step("Navigate Stepper → GST Details → Allotment Details", async () => {
        await page.waitForTimeout(1000);

        await page.locator('.p-stepper-panel', { hasText: 'GST Details' })
            .locator('button:has-text("Next")')
            .click();

        await page.locator('.p-stepper-panel', { hasText: 'Allotment Details' })
            .locator('button:has-text("Next")')
            .click();
    });

    await test.step("Forward Bill to Treasury", async () => {
        await page.getByRole('button', { name: 'Forward To Treasury' }).click();
        await page.getByRole('button', { name: 'Yes, Forward to Treasury' }).click();

        await expect(page.locator('#swal2-title'))
            .toContainText('Bill Forwarded to Treasury Successfully');

        await page.getByRole('button', { name: 'OK' }).click();
        await page.close();
    });
});