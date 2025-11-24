import { test, expect } from "@playwright/test";
import { attachApiStatus } from "../../utils/attach-response";

const apis: { endpoint: string; payload: any }[] = [
    { endpoint: "/api/ActiveHoa/GetActiveHoa", payload: {} },
    { endpoint: "/api/ActiveHoa/GetSnaActiveHoa", payload: {} },
    { endpoint: "/api/ActiveHoa/GetAafsActiveHoa", payload: {} },
    { endpoint: "/api/ActiveHoa/GetDetailHeadList", payload: {} },
    { endpoint: "/api/ActiveHoa/GetDemandList", payload: {} },
    { endpoint: "/api/Bill/GetBillDetails", payload: {} },
    { endpoint: "/api/Bill/GetBillList", payload: {} },
    { endpoint: "/api/Bill/GetAllBillList", payload: {} },
    { endpoint: "/api/Bt/GetBt", payload: {} },
    { endpoint: "/api/Cts/GetSuccessTransactionBeneficiaryDetails", payload: {} },
    { endpoint: "/api/Cts/GetFailedTransactionBeneficiaryDetails", payload: {} },
    {
        endpoint: "/api/Cts/UpdateEcsCancellationPdfStatus",
        payload: { FailedBenId: "3839" },
    },
    { endpoint: "/api/Dashboard/GetFtoStatusCount", payload: {} },
    { endpoint: "/api/Dashboard/GetBillDetailsReport", payload: {} },
    { endpoint: "/api/Dashboard/GetAllotmentReport", payload: {} },
    { endpoint: "/api/Dashboard/GetFtoProgressChartData", payload: {} },
    { endpoint: "/api/Dashboard/GetBillStatusReport", payload: {} },
    { endpoint: "/api/Dashboard/GetBeneficiaryReport", payload: {} },
    { endpoint: "/api/Dashboard/GetJitAllotmentList", payload: {} },
    { endpoint: "/api/Dashboard/GetBillDetailsByStatus", payload: {} },
    { endpoint: "/api/Dashboard/GetBenGstReport", payload: {} },
    { endpoint: "/api/Ddo/GetDdoHoa", payload: {} },
    { endpoint: "/api/Ddo/GetDdoWallet", payload: { activeHoaId: "500200" } },
    { endpoint: "/api/Ddo/GetDdoDetails?ddoCode=MIEPRA008", payload: {} },
    {
        endpoint: "/api/Ddo/GetDdoAllotmentDetails?activeHoaId=500200",
        payload: {},
    },
    { endpoint: "/api/Ddo/GetDdoList", payload: {} },
    { endpoint: "/api/Ecs/GetBillEcs?billId=35176", payload: {} },
    { endpoint: "/api/JitBill/GetHoaDetails", payload: {} },
    { endpoint: "/api/JitBill/GetFtoFromHOA", payload: { hoaId: "500190" } },
    {
        endpoint: "/api/JitBill/AgencyFromHoaForPendingFTO",
        payload: { hoaId: "500190" },
    },
    {
        endpoint: "/api/JitBill/GetPayeeFromFto?ftoRefId=202507031125032985122",
        payload: {},
    },
    { endpoint: "/api/JitBill/GetGstFromFto", payload: { payeeId: "265775" } },
    { endpoint: "/api/JitBill/VoucherFromFto", payload: { payeeId: "265775" } },
    {
        endpoint: "/api/JitBill/GetComponentFromFto",
        payload: { payeeId: "265775" },
    },
    {
        endpoint: "/api/JitBill/GetDeductionFromFto",
        payload: { payeeId: "265775" },
    },
    { endpoint: "/api/JitBill/SendRejectedFto?billId=60631", payload: {} },
    { endpoint: "/api/JitBill/GetJitBillDetails", payload: {} },
    { endpoint: "/api/JitBill/GetForwardedToTreasuryBill", payload: {} },
    { endpoint: "/api/JitBill/JitBillDetails", payload: { BillId: "60631" } },
    {
        endpoint: "/api/JitBill/GetJitAllotmentList",
        payload: { sanctionNo: "D-WB6220250506185121" },
    },
    { endpoint: "/api/JitBill/GetJitAllotmentDetails", payload: {} },
    {
        endpoint: "/api/JitBill/GetBillDetailsDepartmentList",
        payload: { ddoCode: "MIEPRA008" },
    },
    { endpoint: "/api/JitBill/GetBillDetailsSlsCodeList", payload: {} },
    { endpoint: "/api/JitBill/GetAgencyDetailsList", payload: {} },
    { endpoint: "/api/JitBill/GetObjectedBillFromCts", payload: {} },
    { endpoint: "/api/JitBill/GetFtoDetails", payload: {} },
    { endpoint: "/api/JitBill/FtoTrackDetails", payload: {} },
    { endpoint: "/api/JitBill/GetBillCancelledbyDdo", payload: {} },
    { endpoint: "/api/JitBill/GetOldBillList", payload: {} },
    { endpoint: "/api/Master/Treasury", payload: {} },
    { endpoint: "/api/Master/DDOList", payload: {} },
    { endpoint: "/api/Master/GetAllIfsc", payload: {} },
    { endpoint: "/api/Master/FinancialYear", payload: {} },
    { endpoint: "/api/Master/GetHoaDetailsList", payload: {} },
    { endpoint: "/api/Pdf/GetTR26aDataNew?billid=60629", payload: {} },
    {
        endpoint: "/api/Reports/GetDdoAllotmnetBookedBillDetails?ddoCode=MIEPRA008",
        payload: {},
    },
    { endpoint: "/api/Token/TokenList", payload: {} },
    { endpoint: "/api/Token/GetTokens", payload: {} },
    {
        endpoint: "/api/TransactionSummary/TransactionSummary",
        payload: { finYearId: "2526" },
    },
    {
        endpoint:
            "/api/TransactionSummary/GetBillWiseSuccessFailedTransactionDetails",
        payload: {},
    },
    {
        endpoint:
            "/api/TransactionSummary/GetFtoWiseSuccessFailedTransactionDetails",
        payload: {},
    },
    {
        endpoint:
            "/api/TransactionSummary/GetBillWiseGSTSuccessFailedTransactionDetails",
        payload: {},
    },
    {
        endpoint:
            "/api/TransactionSummary/GetFtoWiseGSTSuccessFailedTransactionDetails",
        payload: {},
    },
    { endpoint: "/api/TrMasterDetails/GetTrMasterDetails", payload: {} },
    { endpoint: "/api/TrMasterDetails/GetTrMasterCheckList", payload: {} },
    {
        endpoint: "/api/TrMasterDetails/EnabledDisabledTrMaster?trNumber=31",
        payload: {},
    },
    { endpoint: "/api/TrMasterDetails/GetAllTrMasterDetails", payload: {} },
    { endpoint: "/api/Vouchar/GetVouchers", payload: {} },
];

for (const { endpoint, payload } of apis) {
    test(`POST ${endpoint}`, async ({ request }, testInfo) => {
        const response = await request.post(endpoint, {
            data: payload,
        });

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
        if (body && "apiResponseStatus" in body) {
            expect(
                body.apiResponseStatus,
                `❌ API Business Logic FAILED → ${endpoint}`
            ).toBe(1);
        }
    });
}
