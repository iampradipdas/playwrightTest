import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import type { Reporter, FullResult, TestCase, TestResult } from "@playwright/test/reporter";

class ExcelReporter implements Reporter {
    private apiResults: { name: string; status: string; durationMs: number }[] = [];
    private uiResults: { name: string; status: string; durationMs: number }[] = [];

    onTestEnd(test: TestCase, result: TestResult) {
        const durationMs = result.duration || 0;
        const filePath = test.location?.file || "";
        const normalized = filePath.split(path.sep).join("/").toLowerCase();

        const row = {
            name: test.titlePath().join(" > "),
            status: result.status,
            durationMs,
        };

        if (/\/01_api\//.test(normalized) || normalized.includes("/01_api") || normalized.includes("/api/")) {
            this.apiResults.push(row);
        } else if (/\/02_ui\//.test(normalized) || normalized.includes("/02_ui") || normalized.includes("/ui/")) {
            this.uiResults.push(row);
        } else {
            // fallback by filename or title
            const filename = path.basename(filePath).toLowerCase();
            if (filename.includes("api") || row.name.toLowerCase().includes("api")) this.apiResults.push(row);
            else this.uiResults.push(row);
        }
    }

    async onEnd(result: FullResult) {
        const workbook = new ExcelJS.Workbook();

        const makeSheet = (name: string, rows: { name: string; status: string; durationMs: number }[]) => {
            const sheet = workbook.addWorksheet(name);

            sheet.columns = [
                { header: "Test Name", key: "name", width: 120 },
                { header: "Status", key: "status", width: 15 },
                { header: "Duration (ms)", key: "durationMs", width: 18 },
            ];

            // header style
            const headerRow = sheet.getRow(1);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
                cell.alignment = { vertical: "middle", horizontal: "center" };
            });

            let rowIndex = 2;
            for (const r of rows) {
                const excelRow = sheet.addRow({ name: r.name, status: r.status, durationMs: r.durationMs });

                const bgColor = rowIndex % 2 === 0 ? "FFF2F2F2" : "FFFFFFFF";
                excelRow.eachCell((cell) => {
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
                    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
                });

                const statusCell = excelRow.getCell(2);
                if (r.status === "passed") statusCell.font = { color: { argb: "FF008000" }, bold: true };
                else if (r.status === "failed") statusCell.font = { color: { argb: "FFFF0000" }, bold: true };
                else statusCell.font = { color: { argb: "FFB8860B" }, bold: true };

                const durationCell = excelRow.getCell(3);
                durationCell.value = Number(r.durationMs || 0);

                rowIndex++;
            }
        };

        makeSheet("API Tests", this.apiResults);
        makeSheet("UI Tests", this.uiResults);

        // Summary
        const summary = workbook.addWorksheet("Summary");
        summary.columns = [
            { header: "Sheet", key: "sheet", width: 20 },
            { header: "Total", key: "total", width: 10 },
            { header: "Passed", key: "passed", width: 10 },
            { header: "Failed", key: "failed", width: 10 },
            { header: "Skipped", key: "skipped", width: 10 },
        ];

        const countStatuses = (rows: { status: string }[]) => ({
            total: rows.length,
            passed: rows.filter(r => r.status === "passed").length,
            failed: rows.filter(r => r.status === "failed").length,
            skipped: rows.filter(r => r.status === "skipped").length,
        });

        const apiCounts = countStatuses(this.apiResults as any);
        const uiCounts = countStatuses(this.uiResults as any);
        const overall = { total: apiCounts.total + uiCounts.total, passed: apiCounts.passed + uiCounts.passed, failed: apiCounts.failed + uiCounts.failed, skipped: apiCounts.skipped + uiCounts.skipped };

        summary.addRow({ sheet: "API Tests", ...apiCounts });
        summary.addRow({ sheet: "UI Tests", ...uiCounts });
        summary.addRow({ sheet: "Overall", ...overall });

        // ensure output directory
        const outDir = path.join(process.cwd(), "playwright-report");
        try { if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true }); } catch (e) { /* ignore */ }

        const outPath = path.join(outDir, "playwright-report.xlsx");
        await workbook.xlsx.writeFile(outPath);
        console.log(`✔ Excel report generated: ${outPath}`);
    }
}

export default ExcelReporter;
