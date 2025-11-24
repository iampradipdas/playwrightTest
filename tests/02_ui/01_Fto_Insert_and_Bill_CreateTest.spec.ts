import { test, expect } from "../../utils/auth.setup";
import { publishToQueue } from "../../utils/rabbitmq";
import { saveData, getData } from "../../utils/storage";


function generateSanctionNo(): string {
    const prefix = "D-WB11";

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    const randomDigits = Math.floor(100000 + Math.random() * 900000);

    return `${prefix}${yyyy}${mm}${dd}${randomDigits}`;
}

function generateJitReferenceNo(): string {
    const now = new Date();

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    const hh = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    const random7 = Math.floor(1000000 + Math.random() * 9000000);

    return `${yyyy}${mm}${dd}${hh}${mi}${ss}${random7}`;
}

const ddoCode = "MIEPRA008";
const agencyCode = "WBHG00008434";
const agencyName = "DISTRICT HORTICULTURE OFFICE HOOGHLY(WBHG00008434)";
const hoaId = 500025;
const sanctionNo = generateSanctionNo();
const jitReferenceNo = generateJitReferenceNo();

test.describe.configure({ mode: 'serial' });

test.describe("JIT Billing Fto Test", () => {

    test('Publish Allotment payload to ebilling allotment Queue', async () => {
        const payload = [
            {
                "IsWithdraw": 0,
                "AllotmentId": "8415d932-438b-4401-9d38-fef690f13806",
                "Slscode": "WB8",
                "Agencycode": agencyCode,
                "LimitType": "A",
                "Amount": 0.0,
                "Finyear": 2526,
                "AgencyName": agencyName,
                "SelfLimitAmt": 60000.0,
                "ChildLimitAmt": 0.0,
                "TotalAmount": 60000.0,
                "HoaId": hoaId,
                "TreasuryCode": "HGB",
                "DdoCode": ddoCode,
                "SanctionDate": "2025-10-08",
                "SanctionNo": sanctionNo,
                "HeadWiseSanctionId": "329",
                "SlsLimitDistributionId": "121",
                "FromSanctionNo": ""
            }
        ]


        await publishToQueue("wbjit_ebilling_allotment", payload);
    });

    test('Publish FTO payload to ebilling Fto queue', async () => {
        const payload = {
            "FinYear": 2526,
            "JitReferenceId": 87477,
            "JitReferenceNo": jitReferenceNo,
            "OldJitReferenceNo": null,
            "FtoMode": 0,
            "FtoCategory": 100,
            "FtoModule": 2000,
            "FtoType": 1000,
            "AgencyCode": agencyCode,
            "AgencyName": agencyName,
            "DistrictCodeLgd": "304",
            "CategoryCode": "OT",
            "TOPUP": false,
            "Reissue": false,
            "GrossAmount": 9000.0,
            "NetAmount": 3000.0,
            "ReissueAmount": 0.0,
            "TopUpAmount": 0.0,
            "TotalAmtForCSCalcSC": 0.0,
            "TotalAmtForCSCalcSCOC": 0.0,
            "TotalAmtForCSCalcSCCC": 0.0,
            "TotalAmtForCSCalcSCSAL": 0.0,
            "TotalAmtForCSCalcST": 0.0,
            "TotalAmtForCSCalcSTOC": 0.0,
            "TotalAmtForCSCalcSTCC": 0.0,
            "TotalAmtForCSCalcSTSAL": 0.0,
            "TotalAmtForCSCalcOT": 9000.0,
            "TotalAmtForCSCalcOTOC": 9000.0,
            "TotalAmtForCSCalcOTCC": 0.0,
            "TotalAmtForCSCalcOTSAL": 0.0,
            "SlsCode": "WB62",
            "SchemeName": "WB NIRMAL BHARAT ABHIYAN",
            "HoaId": hoaId,
            "DdoCode": ddoCode,
            "TreasCode": "HGB",
            "ModuleId": "000",
            "PayeeDetails": [
                {
                    "FtoPayeeId": 632349,
                    "PayeeId": "SPD/" + agencyCode + "/2995950",
                    "PayeeType": 2,
                    "AccountType": 2,
                    "BeneficiaryName": "GOPINATH ENTERPRISE",
                    "Aadhar": null,
                    "PAN": "GWUPS8921J",
                    "Ifsc": "BDBL0001299",
                    "AccountNumber": "10220014731842",
                    "GrossAmount": 3000.0,
                    "NetAmount": 1000.0,
                    "ReissueAmount": 0.0,
                    "LastEndToEndId": null,
                    "DistrictCodeLgd": "304",
                    "StateCodeLgd": "19",
                    "UrbanRuralFlag": "N",
                    "BlockLgd": null,
                    "PanchayatLgd": null,
                    "VillageLgd": null,
                    "TehsilLgd": null,
                    "TownLgd": null,
                    "WardLgd": null
                },
                {
                    "FtoPayeeId": 632358,
                    "PayeeId": "SPD/" + agencyCode + "/2995936",
                    "PayeeType": 2,
                    "AccountType": 2,
                    "BeneficiaryName": "J J ENTERPRISE",
                    "Aadhar": null,
                    "PAN": "JFGPS4245F",
                    "Ifsc": "PUNB0078720",
                    "AccountNumber": "0787202100001109",
                    "GrossAmount": 3000.0,
                    "NetAmount": 1000.0,
                    "ReissueAmount": 0.0,
                    "LastEndToEndId": null,
                    "DistrictCodeLgd": "304",
                    "StateCodeLgd": "19",
                    "UrbanRuralFlag": "N",
                    "BlockLgd": null,
                    "PanchayatLgd": null,
                    "VillageLgd": null,
                    "TehsilLgd": null,
                    "TownLgd": null,
                    "WardLgd": null
                },
                {
                    "FtoPayeeId": 632351,
                    "PayeeId": "SPD/" + agencyCode + "/2995908",
                    "PayeeType": 2,
                    "AccountType": 2,
                    "BeneficiaryName": "SEIKH ENTERPRISE",
                    "Aadhar": null,
                    "PAN": "DDFPS4685N",
                    "Ifsc": "PUNB0078720",
                    "AccountNumber": "0787050011529",
                    "GrossAmount": 3000.0,
                    "NetAmount": 1000.0,
                    "ReissueAmount": 0.0,
                    "LastEndToEndId": null,
                    "DistrictCodeLgd": "304",
                    "StateCodeLgd": "19",
                    "UrbanRuralFlag": "N",
                    "BlockLgd": null,
                    "PanchayatLgd": null,
                    "VillageLgd": null,
                    "TehsilLgd": null,
                    "TownLgd": null,
                    "WardLgd": null
                }
            ],
            "ComponentDetails": [
                {
                    "PayeeId": "SPD/" + agencyCode + "/2995950",
                    "ComponentCode": "02.02.02.01",
                    "ComponentName": "Soak pits",
                    "Amount": 3000.0
                },
                {
                    "PayeeId": "SPD/" + agencyCode + "/2995936",
                    "ComponentCode": "02.02.02.01",
                    "ComponentName": "Soak pits",
                    "Amount": 3000.0
                },
                {
                    "PayeeId": "SPD/" + agencyCode + "/2995908",
                    "ComponentCode": "02.02.02.01",
                    "ComponentName": "Soak pits",
                    "Amount": 3000.0
                }
            ],
            "BtDetails": [
                {
                    "PayeeId": "SPD/" + agencyCode + "/2995936",
                    "BtCode": "67",
                    "BtName": "Income Tax - T.D.S",
                    "BtType": "Treasury BT",
                    "Amount": 1000.0
                },
                {
                    "PayeeId": "SPD/" + agencyCode + "/2995908",
                    "BtCode": "67",
                    "BtName": "Income Tax - T.D.S",
                    "BtType": "Treasury BT",
                    "Amount": 1000.0
                },
                {
                    "PayeeId": "SPD/" + agencyCode + "/2995950",
                    "BtCode": "67",
                    "BtName": "Income Tax - T.D.S",
                    "BtType": "Treasury BT",
                    "Amount": 1000.0
                }
            ],
            "VoucherDetails": [
                {
                    "FTO_Id": 87477,
                    "FTO_Payee_id": 632349,
                    "MasterPayeeId": 2995950,
                    "VoucherNo": "6",
                    "VoucherDate": "2025-10-10T00:00:00",
                    "DescCharges": "Const of CSC near Kella Police Camp",
                    "Authority": "BDO, Kultali",
                    "Amount": 3000,
                    "grossAmount": null,
                    "RefNo": jitReferenceNo,
                    "PayeeId": "SPD/" + agencyCode + "/2995950"
                },
                {
                    "FTO_Id": 87477,
                    "FTO_Payee_id": 632358,
                    "MasterPayeeId": 2995936,
                    "VoucherNo": "9",
                    "VoucherDate": "2025-10-10T00:00:00",
                    "DescCharges": "Const of Modified Leach Pit",
                    "Authority": "BDO, KULTALI",
                    "Amount": 3000,
                    "grossAmount": null,
                    "RefNo": jitReferenceNo,
                    "PayeeId": "SPD/" + agencyCode + "/2995936"
                },
                {
                    "FTO_Id": 87477,
                    "FTO_Payee_id": 632351,
                    "MasterPayeeId": 2995908,
                    "VoucherNo": "8",
                    "VoucherDate": "2025-10-10T00:00:00",
                    "DescCharges": "Const of Modified Leachpit",
                    "Authority": "BDO, KULTALI",
                    "Amount": 3000,
                    "grossAmount": null,
                    "RefNo": jitReferenceNo,
                    "PayeeId": "SPD/" + agencyCode + "/2995908"
                }
            ],
            "GSTDetails": [
                {
                    "PayeeId": "SPD/" + agencyCode + "/2995950",
                    "PayeeName": "GOPINATH ENTERPRISE",
                    "PayeeGstIn": "19GWUPS8921J1ZA",
                    "InvoiceNo": "NA",
                    "InvoiceValue": 175690.0,
                    "InvoiceDate": "2025-10-10",
                    "GSTAmount": 1000.0,
                    "SGSTAmount": 500.0,
                    "CGSTAmount": 500.0,
                    "IsIgst": false,
                    "IgstTotal": 0.0
                },
                {
                    "PayeeId": "SPD/" + agencyCode + "/2995936",
                    "PayeeName": "J J ENTERPRISE",
                    "PayeeGstIn": "19JFGPS4245F1Z0",
                    "InvoiceNo": "NA",
                    "InvoiceValue": 1128100.0,
                    "InvoiceDate": "2025-10-10",
                    "GSTAmount": 1000.0,
                    "SGSTAmount": 500.0,
                    "CGSTAmount": 500.0,
                    "IsIgst": false,
                    "IgstTotal": 0.0
                },
                {
                    "PayeeId": "SPD/" + agencyCode + "/2995908",
                    "PayeeName": "SEIKH ENTERPRISE",
                    "PayeeGstIn": "19DDFPS4685N1ZI",
                    "InvoiceNo": "NA",
                    "InvoiceValue": 386000.0,
                    "InvoiceDate": "2025-10-10",
                    "GSTAmount": 1000.0,
                    "SGSTAmount": 500.0,
                    "CGSTAmount": 500.0,
                    "IsIgst": false,
                    "IgstTotal": 0.0
                }
            ],
            "SanctionDetails": [
                {
                    "RefNo": jitReferenceNo,
                    "OldRefNo": null,
                    "LimitCode": "116947",
                    "SanctionNo": sanctionNo,
                    "SanctionAmt": 41792990.0,
                    "SanctionDate": "2025-10-08",
                    "HoaId": hoaId.toString(),
                    "DebitAmt": 9000.0
                }
            ]
        }

        saveData("jitReferenceNo", jitReferenceNo);

        // Publish JSON to RabbitMQ queue
        await publishToQueue("wbjit_ebilling_fto", payload);
    });

    test('Bill Create and Verify', async ({ pageWithToken }) => {
        const page = pageWithToken;
        await test.step("Navigate to Received Advice Page", async () => {
            await page.waitForTimeout(1000);
            await page.getByText("JIT-Billing").click();
            await page.locator('a[href="/received-advice"]').click();
        });

        await test.step("Search FTO Number For Bill Create", async () => {
            await page.getByRole('textbox', { name: 'Search By FTO No' }).fill(jitReferenceNo.toString());
            await page.locator('div')
                .filter({ hasText: /^Search By FTO No$/ })
                .getByRole('button')
                .first()
                .click();
        });

        await test.step("Select FTO and Generate Bill", async () => {
            await page.locator('.p-checkbox-box').first().click();
            await page.getByRole('button', { name: 'Generate Bill' }).click();
            await page.getByRole('button', { name: 'Save' }).click();
        });

        await test.step("Extract Reference Number and Version", async () => {
            const refText = await page.locator('#swal2-html-container strong').textContent();
            if (!refText) throw new Error("Reference text not found!");

            const [referenceNo, version] = refText.split('-');

            saveData("billReferenceNo", referenceNo);
            saveData("version", version);

            await page.getByRole('button', { name: 'OK' }).click();
        });

        await test.step("Navigate to Generated JIT Bill Page", async () => {
            await page.locator('a[href="/generated-jit-bill"]').click();
        });

        await test.step("Search by Reference Number", async () => {
            await page.getByPlaceholder('Search By').click();
            await page.getByLabel('Reference No').getByText('Reference No').click();
            await page.getByRole('textbox', { name: 'Enter to Search' }).fill(getData("billReferenceNo"));
            await page.locator('button .pi.pi-search').click();
        });

        await test.step("Extract Bill Number and Save", async () => {
            await page.waitForTimeout(1000);
            const billNo = await page.locator('tbody tr').first().locator('td').nth(3).innerText();

            saveData("billNumber", billNo);
        })

        await test.step("Verify Reference Number in Table Results", async () => {
            await expect(page.locator('tbody')).toContainText(getData("billReferenceNo"));
        });
    })
});