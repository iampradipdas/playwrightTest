import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import type {
    Reporter,
    FullResult,
    TestCase,
    TestResult,
} from "@playwright/test/reporter";

class ExcelReporter implements Reporter {
    private apiResults: {
        name: string;
        file: string;
        status: string;
        durationSeconds: string;
        errorMessage: string;
        screenshotPath: string;
        tracePath: string;
    }[] = [];
    private uiResults: {
        name: string;
        file: string;
        status: string;
        durationSeconds: string;
        errorMessage: string;
        screenshotPath: string;
        tracePath: string;
    }[] = [];

    // Collect results
    onTestEnd(test: TestCase, result: TestResult) {
        const durationSeconds = (result.duration / 1000).toFixed(2); // convert ms → seconds

        const filePath = test.location?.file || "";
        const normalized = filePath.split(path.sep).join("/").toLowerCase();

        const file = filePath;

        // Collect error message
        let errorMessage = "";
        try {
            // result.error or result.errors may exist depending on Playwright version
            // @ts-ignore
            if (result.error && (result as any).error.message) {
                // @ts-ignore
                errorMessage = String((result as any).error.message);
            } else if ((result as any).errors && Array.isArray((result as any).errors)) {
                // @ts-ignore
                errorMessage = (result as any).errors.map((e: any) => e.message || String(e)).join("\n");
            }
        } catch (e) {
            errorMessage = "";
        }

        // Find screenshot / trace attachments
        let screenshotPath = "";
        let tracePath = "";
        try {
            // @ts-ignore
            const attachments = result.attachments || [];
            for (const a of attachments) {
                const aPath = (a.path as string) || "";
                const aName = (a.name || "").toLowerCase();
                if (!screenshotPath && (aName.includes("screenshot") || String(aPath).toLowerCase().endsWith('.png'))) {
                    screenshotPath = aPath;
                }
                if (!tracePath && (aName.includes("trace") || String(aPath).toLowerCase().endsWith('.zip') || String(aPath).toLowerCase().endsWith('.trace'))) {
                    tracePath = aPath;
                }
            }
        } catch (e) {
            // ignore
        }

        const row = {
            name: test.titlePath().join(" > "),
            file,
            status: result.status,
            durationSeconds,
            errorMessage,
            screenshotPath,
            tracePath,
        };

        if (/\/01_api\//.test(normalized) || normalized.includes("/01_api") || normalized.includes("/api/") || normalized.includes("/01_api.ts")) {
            this.apiResults.push(row);
        } else if (/\/02_ui\//.test(normalized) || normalized.includes("/02_ui") || normalized.includes("/ui/")) {
            this.uiResults.push(row);
        } else {
            // Fallback: try to infer from filename or test title
            const filename = path.basename(filePath).toLowerCase();
            if (filename.includes("api") || row.name.toLowerCase().includes("api")) {
                this.apiResults.push(row);
            } else {
                this.uiResults.push(row);
            }
        }
    }

    // Export Excel
    async onEnd(result: FullResult) {
        const workbook = new ExcelJS.Workbook();

        const makeSheet = (name: string, rows: { name: string; file: string; status: string; durationSeconds: string; errorMessage: string; screenshotPath: string; tracePath: string }[]) => {
            const sheet = workbook.addWorksheet(name);

            sheet.columns = [
                { header: "File", key: "file", width: 60 },
                { header: "Test Name", key: "name", width: 130 },
                { header: "Status", key: "status", width: 15 },
                { header: "Duration (s)", key: "durationSeconds", width: 15 },
                { header: "Error/Failure Message", key: "errorMessage", width: 80 },
                { header: "Screenshot path", key: "screenshotPath", width: 80 },
                { header: "Trace path", key: "tracePath", width: 80 },
            ];

            // Style Header Row
            const headerRow = sheet.getRow(1);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FF1F4E78" },
                };
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });

            let rowIndex = 2;

            for (const row of rows) {
                const excelRow = sheet.addRow(row as any);

                // Alternate row background color
                const bgColor = rowIndex % 2 === 0 ? "FFF2F2F2" : "FFFFFFFF";

                excelRow.eachCell((cell) => {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: bgColor },
                    };
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                });

                // Status color coding (Status is column 3)
                const statusCell = excelRow.getCell(3);

                if (row.status === "passed") {
                    statusCell.font = { color: { argb: "FF008000" }, bold: true }; // Green
                } else if (row.status === "failed") {
                    statusCell.font = { color: { argb: "FFFF0000" }, bold: true }; // Red
                } else {
                    statusCell.font = { color: { argb: "FFB8860B" }, bold: true }; // Yellow
                }

                // Add hyperlinks for attachments if present
                try {
                    const screenshotCell = excelRow.getCell("screenshotPath");
                    if (row.screenshotPath) {
                        const full = path.isAbsolute(row.screenshotPath) ? row.screenshotPath : path.join(process.cwd(), row.screenshotPath);
                        const link = "file:///" + full.split(path.sep).join("/");
                        // @ts-ignore
                        screenshotCell.value = { text: path.basename(full), hyperlink: link };
                    }

                    const traceCell = excelRow.getCell("tracePath");
                    if (row.tracePath) {
                        const full = path.isAbsolute(row.tracePath) ? row.tracePath : path.join(process.cwd(), row.tracePath);
                        const link = "file:///" + full.split(path.sep).join("/");
                        // @ts-ignore
                        traceCell.value = { text: path.basename(full), hyperlink: link };
                    }
                } catch (e) {
                    // ignore
                }

                rowIndex++;
            }
        };

        // Create sheets for API and UI
        makeSheet("API Tests", this.apiResults);
        makeSheet("UI Tests", this.uiResults);

        // Summary sheet
        const summary = workbook.addWorksheet("Summary");
        summary.columns = [
            { header: "Sheet", key: "sheet", width: 20 },
            { header: "Total", key: "total", width: 10 },
            { header: "Passed", key: "passed", width: 10 },
            { header: "Failed", key: "failed", width: 10 },
            { header: "Skipped", key: "skipped", width: 10 },
        ];

        const countStatuses = (rows: { status: string }[]) => {
            const total = rows.length;
            const passed = rows.filter(r => r.status === "passed").length;
            const failed = rows.filter(r => r.status === "failed").length;
            const skipped = rows.filter(r => r.status === "skipped").length;
            return { total, passed, failed, skipped };
        };

        const apiCounts = countStatuses(this.apiResults);
        const uiCounts = countStatuses(this.uiResults);
        const overall = { total: apiCounts.total + uiCounts.total, passed: apiCounts.passed + uiCounts.passed, failed: apiCounts.failed + uiCounts.failed, skipped: apiCounts.skipped + uiCounts.skipped };

        summary.addRow({ sheet: "API Tests", ...apiCounts });
        summary.addRow({ sheet: "UI Tests", ...uiCounts });
        summary.addRow({ sheet: "Overall", ...overall });

        // Ensure output directory exists
        const outDir = path.join(process.cwd(), "playwright-report");
        try {
            if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        } catch (e) {
            // ignore
        }

        const outPath = path.join(outDir, "playwright-report.xlsx");
        await workbook.xlsx.writeFile(outPath);
        console.log(`✔ Excel report generated: ${outPath}`);
    }

}

export default ExcelReporter;
