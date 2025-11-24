import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import type { Reporter, FullResult, TestCase, TestResult } from "@playwright/test/reporter";

class ExcelReporter implements Reporter {
    private apiResults: { name: string; status: string; durationMs: number; apiStatus?: string; apiResponseStatus?: string | number | null; apiMessage?: string | null }[] = [];
    private uiResults: { name: string; status: string; durationMs: number; screenshot?: string }[] = [];

    onTestEnd(test: TestCase, result: TestResult) {
        const durationMs = result.duration || 0;
        const filePath = test.location?.file || "";
        const normalized = filePath.split(path.sep).join("/").toLowerCase();

        const row: { name: string; status: string; durationMs: number; apiStatus?: string; apiResponseStatus?: string | number | null; apiMessage?: string | null; screenshot?: string } = {
            name: test.titlePath().join(" > "),
            status: result.status,
            durationMs,
        };

        if (/\/01_api\//.test(normalized) || normalized.includes("/01_api") || normalized.includes("/api/")) {
            // capture any attached api-status and api-response
            try {
                for (const a of result.attachments || []) {
                    if (a.name === 'api-status') {
                        let val: string | undefined;

                        // read from path or body
                        try {
                            if ((a as any).path) {
                                val = fs.readFileSync((a as any).path, 'utf8').toString().trim();
                            } else if ((a as any).body) {
                                val = Buffer.isBuffer((a as any).body) ? (a as any).body.toString() : String((a as any).body);
                            }
                        } catch (e) {

                        }
                        if (val) row.apiStatus = val;
                    }

                    if (a.name === 'api-response') {
                        let val: string | undefined;
                        try {
                            if ((a as any).path) {
                                val = fs.readFileSync((a as any).path, 'utf8');
                            } else if ((a as any).body) {
                                val = Buffer.isBuffer((a as any).body) ? (a as any).body.toString() : String((a as any).body);
                            }
                        } catch (e) {

                        }
                        if (val) {
                            try {
                                const parsed = JSON.parse(val);
                                // apiResponseStatus or under result
                                const apiRespStatus = parsed.apiResponseStatus ?? (parsed.result && parsed.result.apiResponseStatus);
                                const message = parsed.message ?? null;
                                if (apiRespStatus !== undefined) row.apiResponseStatus = apiRespStatus;
                                if (message !== undefined) row.apiMessage = typeof message === 'string' ? message : JSON.stringify(message);
                            } catch (e) {

                            }
                        }
                    }
                    // API tests do not need screenshots; skip any image attachments here
                }
            } catch (e) { }

            // push a sanitized object to apiResults that excludes any screenshot field
            this.apiResults.push({
                name: row.name,
                status: row.status,
                durationMs: row.durationMs,
                apiStatus: row.apiStatus,
                apiResponseStatus: row.apiResponseStatus,
                apiMessage: row.apiMessage,
            });
        } else if (/\/02_ui\//.test(normalized) || normalized.includes("/02_ui") || normalized.includes("/ui/")) {
            // capture screenshot attachments for UI tests
            try {
                for (const a of result.attachments || []) {
                    const lower = (a.name || '').toLowerCase();
                    const p = (a as any).path || null;
                    const ct = (a as any).contentType || '';
                    if (lower.includes('screenshot') || (p && String(p).toLowerCase().endsWith('.png')) || ct.includes('image')) {
                        if (result.status === 'failed') row.screenshot = (a as any).path || row.screenshot;
                    }
                }
            } catch (e) { }

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
        // column definitions and styles
        const makeSheet = (name: string, rows: any[], isApi = false) => {
            const sheet = workbook.addWorksheet(name);
            // Freeze the top header row
            try {
                sheet.views = [{ state: 'frozen', ySplit: 1 } as any];
            } catch (e) { }

            if (isApi) {
                sheet.columns = [
                    { header: "Test Name", key: "name", width: 120 },
                    { header: "Status", key: "status", width: 15 },
                    { header: "Response Status", key: "apiStatus", width: 18 },
                    { header: "API Response Status", key: "apiResponseStatus", width: 20 },
                    { header: "Message", key: "apiMessage", width: 80 },
                    { header: "Duration (s)", key: "durationMs", width: 12 },
                ];
            } else {
                sheet.columns = [
                    { header: "Test Name", key: "name", width: 120 },
                    { header: "Status", key: "status", width: 15 },
                    { header: "Screenshot", key: "screenshot", width: 40 },
                    { header: "Duration (s)", key: "durationMs", width: 12 },
                ];
            }

            // header style
            const headerRow = sheet.getRow(1);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
                cell.alignment = { vertical: "middle", horizontal: "center" };
            });

            let rowIndex = 2;
            for (const r of rows) {
                const rowData: any = { name: r.name, status: r.status, durationMs: r.durationMs };
                if (isApi) {
                    rowData.apiStatus = r.apiStatus || '';
                    rowData.apiResponseStatus = r.apiResponseStatus !== undefined ? r.apiResponseStatus : '';
                    rowData.apiMessage = r.apiMessage ?? '';
                } else {
                    rowData.screenshot = r.screenshot ?? '';
                }
                const excelRow = sheet.addRow(rowData);

                const bgColor = rowIndex % 2 === 0 ? "FFF2F2F2" : "FFFFFFFF";
                excelRow.eachCell((cell) => {
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
                    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
                });

                const statusCell = excelRow.getCell(2);
                if (r.status === "passed") statusCell.font = { color: { argb: "FF008000" }, bold: true };
                else if (r.status === "failed") statusCell.font = { color: { argb: "FFFF0000" }, bold: true };
                else statusCell.font = { color: { argb: "FFB8860B" }, bold: true };

                // duration cell index depends on isApi; write seconds (3 decimal places)
                const durationCell = excelRow.getCell(isApi ? 6 : 4);
                const secs = Number(((r.durationMs || 0) / 1000).toFixed(3));
                durationCell.value = secs;

                // if API, style the apiStatus column (3)
                if (isApi) {
                    const apiCell = excelRow.getCell(3);
                    apiCell.alignment = { horizontal: 'center' };
                    const apiRespCell = excelRow.getCell(4);
                    apiRespCell.alignment = { horizontal: 'center' };
                    const msgCell = excelRow.getCell(5);
                    msgCell.alignment = { wrapText: true, horizontal: 'left' };
                }

                // if UI sheet, screenshot is column 3
                if (!isApi) {
                    const ssCell = excelRow.getCell(3);
                    if (rowData.screenshot) {
                        try {
                            const absolute = path.isAbsolute(rowData.screenshot) ? rowData.screenshot : path.join(process.cwd(), rowData.screenshot);
                            const href = 'file:///' + absolute.split(path.sep).join('/');
                            ssCell.value = { text: path.basename(absolute), hyperlink: href };
                            ssCell.font = { color: { argb: 'FF0000FF' }, underline: true };
                        } catch (e) { }
                    }
                }

                rowIndex++;
            }
        };

        makeSheet("API Tests", this.apiResults, true);
        makeSheet("UI Tests", this.uiResults, false);

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

        // Style summary header and rows
        const summaryHeader = summary.getRow(1);
        summaryHeader.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
            cell.alignment = { vertical: "middle", horizontal: "center" };
        });

        // Style data rows: API, UI, Overall
        for (let i = 2; i <= 4; i++) {
            const row = summary.getRow(i);
            const bg = i % 2 === 0 ? "FFF7F7F7" : "FFFFFFFF";
            row.eachCell((cell) => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
                cell.alignment = { vertical: "middle", horizontal: "center" };
            });

            const passedCell = row.getCell(3);
            const failedCell = row.getCell(4);
            const skippedCell = row.getCell(5);

            passedCell.font = { color: { argb: "FF006100" }, bold: true };
            failedCell.font = { color: { argb: "FFFF0000" }, bold: true };
            skippedCell.font = { color: { argb: "FF9C6500" }, bold: true };

            // Highlight Overall row
            const sheetName = String(row.getCell(1).value || '');
            if (sheetName === 'Overall') {
                row.eachCell((cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
                    cell.font = { bold: true };
                });
            }
        }

        // ensure output directory
        const outDir = path.join(process.cwd(), "playwright-report");
        try { if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true }); } catch (e) { /* ignore */ }

        const outPath = path.join(outDir, "playwright-report.xlsx");
        await workbook.xlsx.writeFile(outPath);
        console.log(`✔ Excel report generated: ${outPath}`);
    }
}

export default ExcelReporter;
