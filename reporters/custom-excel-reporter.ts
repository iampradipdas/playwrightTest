import ExcelJS from "exceljs";
import path from "path";
import type {
    Reporter,
    FullResult,
    TestCase,
    TestResult,
} from "@playwright/test/reporter";

class ExcelReporter implements Reporter {
    private apiResults: { name: string; status: string; durationSeconds: string }[] = [];
    private uiResults: { name: string; status: string; durationSeconds: string }[] = [];

    // Collect results
    onTestEnd(test: TestCase, result: TestResult) {
        const durationSeconds = (result.duration / 1000).toFixed(2); // convert ms → seconds

        const filePath = test.location?.file || "";
        const normalized = filePath.split(path.sep).join("/").toLowerCase();

        const row = {
            name: test.titlePath().join(" > "),
            status: result.status,
            durationSeconds,
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

        const makeSheet = (name: string, rows: { name: string; status: string; durationSeconds: string }[]) => {
            const sheet = workbook.addWorksheet(name);

            sheet.columns = [
                { header: "Test Name", key: "name", width: 130 },
                { header: "Status", key: "status", width: 15 },
                { header: "Duration (seconds)", key: "durationSeconds", width: 20 },
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
                const excelRow = sheet.addRow(row);

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

                // Status color coding
                const statusCell = excelRow.getCell(2);

                if (row.status === "passed") {
                    statusCell.font = { color: { argb: "FF008000" }, bold: true }; // Green
                } else if (row.status === "failed") {
                    statusCell.font = { color: { argb: "FFFF0000" }, bold: true }; // Red
                } else {
                    statusCell.font = { color: { argb: "FFB8860B" }, bold: true }; // Yellow
                }

                rowIndex++;
            }
        };

        // Create sheets for API and UI
        makeSheet("API Tests", this.apiResults);
        makeSheet("UI Tests", this.uiResults);

        const outPath = path.join(process.cwd(), "playwright-report", "playwright-report.xlsx");
        await workbook.xlsx.writeFile(outPath);
        console.log(`✔ Excel report generated: ${outPath}`);
    }

}

export default ExcelReporter;
