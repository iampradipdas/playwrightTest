import { test, expect } from '@playwright/test';
import { attachApiStatus } from '../../utils/attach-response';

const apis: string[] = [
	"/api/ActiveHoa/GetSubDetailHeadList?detailHeadCode=01",
	"/api/Bill/GetBillStatus?billid=2025",
	"/api/Bill/FetchFtoBillDetails/2025010719005922",
	"/api/Bt/GetBt",

	"/api/Ddo/GetDdoDetailsByDdoCode",

	"/api/JitBill/EcsDetails/60631",
	"/api/JitBill/BtDetails/60631",
	"/api/JitBill/TrDetails/60631",
	"/api/JitBill/SanctionFtoDetails/60630",
	"/api/JitBill/GetVoucherDetails/60630",
	"/api/JitBill/GetCpinReissueBillVoucherDetails/60630",
	"/api/JitBill/JitSnactionDetails",
	"/api/JitBill/SanctionDetailsByBillId/60630",
	"/api/JitBill/GetJitBillDetailsView/60630",
	"/api/JitBill/GetJitEcsView/60630",
	"/api/JitBill/GetTr10Details?billId=60630",

	"/api/Pdf/GetEcsData?billid=60629",
	"/api/Pdf/GetBillBtData?billid=60629",
	"/api/Pdf/GetTR26aData?billid=60629",
	"/api/Pdf/GetBillDetailsData?billid=60629",

	"/api/Reports/GetTrWiseBillCount",
	"/api/Reports/GetTrWiseBillSendTotreasury",
	"/api/Reports/GetStatusWiseBillCount",

	"/api/Tr/GetTrDetailById?billId=60629"
];

for (const endpoint of apis) {
	test(`GET ${endpoint}`, async ({ request }, testInfo) => {
		const response = await request.get(endpoint);

		// attach HTTP status and response body for reporter
		await attachApiStatus(testInfo, response);

		expect(response.status(), `API FAILED → ${endpoint}`).toBe(200);

		let body: any = null;
		try {
			body = await response.json();
		} catch {
			throw new Error(`❌ ${endpoint} — Response is not valid JSON`);
		}

		// If backend returns apiResponseStatus
		if (body && 'apiResponseStatus' in body) {
			expect(body.apiResponseStatus, `❌ API Business Logic FAILED → ${endpoint}`).toBe(1);
		}
	});
}

