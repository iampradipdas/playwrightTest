import ExcelJS from "exceljs";
import type {
    Reporter,
    FullResult,
    TestCase,
    TestResult,
} from "@playwright/test/reporter";

class ExcelReporter implements Reporter {
    private results: {
        name: string;
        status: string;
        durationSeconds: string;
    }[] = [];

    // Collect results
    onTestEnd(test: TestCase, result: TestResult) {
        const durationSeconds = (result.duration / 1000).toFixed(2); // convert ms → seconds

        this.results.push({
            name: test.titlePath().join(" > "),
            status: result.status,
            durationSeconds,
        });
    }

    // Export Excel
    async onEnd(result: FullResult) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Test Results");

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

        for (const row of this.results) {
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

        await workbook.xlsx.writeFile("playwright-report.xlsx");
        console.log("✔ Excel report generated: playwright-report.xlsx");
    }

}

export default ExcelReporter;
