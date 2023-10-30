"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const Tools_1 = __importDefault(require("../../../React/Tools"));
const ToolsDate_1 = __importDefault(require("../../../React/ToolsDate"));
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../View/Resultsets/FilterableTable/FilterableTable"));
const ContractsController_1 = require("../ContractsController");
const ContractDetailsContext_1 = require("./ContractDetailsContext");
function ContractOurDetails() {
    const { contract, setContract, contractsRepository } = (0, ContractDetailsContext_1.useContractDetails)();
    const [settlemenData, setSettlemenData] = (0, react_1.useState)(undefined);
    const [invoices, setInvoices] = (0, react_1.useState)([]);
    if (!contract)
        return react_1.default.createElement(react_bootstrap_1.Alert, { variant: 'danger' }, "Nie wybrano umowy");
    //fetch data
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            console.log(`ContracOurDetails: fetchData():: contract.id: ${contract?.id}`);
            if (!contract?.id)
                throw new Error('Nie wybrano kontraktu');
            const contractIdString = contract.id.toString();
            const fetchSettlementData = (await ContractsController_1.contractsSettlementRepository.loadItemsFromServerPOST([{ id: contractIdString }]))[0];
            const fetchInvoicesData = (await ContractsController_1.invoicesRepository.loadItemsFromServerPOST([{ contractId: contractIdString }]));
            try {
                const [settlementData,] = await Promise.all([
                    fetchSettlementData,
                    fetchInvoicesData
                ]);
                setSettlemenData(settlementData);
                setInvoices(fetchInvoicesData);
            }
            catch (error) {
                console.error("Error fetching data", error);
                // Handle error as you see fit
            }
        }
        ;
        fetchData();
    }, []);
    function renderInvoiceTotaValue(invoice) {
        return react_1.default.createElement(react_1.default.Fragment, null, invoice._totalNetValue && react_1.default.createElement("div", { className: "text-end" }, Tools_1.default.formatNumber(invoice._totalNetValue)));
    }
    function renderCoordinatorData() {
        if (!contract)
            return (react_1.default.createElement(react_bootstrap_1.Placeholder, { as: 'div', animation: "glow" },
                react_1.default.createElement(react_bootstrap_1.Placeholder, { xs: 6 })));
        let coordinatorName = contract?._manager ? `${contract._manager.name} ${contract._manager.surname}` : 'Nie określono';
        return (react_1.default.createElement(react_1.default.Fragment, null, `Koordynator(ka): ${coordinatorName}`));
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            react_1.default.createElement(react_bootstrap_1.Container, null,
                react_1.default.createElement(react_bootstrap_1.Row, { className: 'mt-3' },
                    react_1.default.createElement(react_bootstrap_1.Col, null, contract.description && react_1.default.createElement("p", null,
                        "Opis: ",
                        contract.description))),
                react_1.default.createElement(react_bootstrap_1.Row, { className: 'mt-3 text-end' },
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                        react_1.default.createElement("div", null, "Warto\u015B\u0107 netto, z\u0142:"),
                        settlemenData?.value
                            ? react_1.default.createElement("h5", null, Tools_1.default.formatNumber(settlemenData.value))
                            : 'Jeszcze nie określono'),
                    react_1.default.createElement(CommonComponents_1.MyTooltip, { content: 'Na podstawie faktur wys\u0142anych', placement: 'top' },
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                            react_1.default.createElement("div", null, "Rozliczono, z\u0142:"),
                            settlemenData?.totalIssuedValue
                                ? react_1.default.createElement("h5", null, Tools_1.default.formatNumber(settlemenData.totalIssuedValue))
                                : 'Jeszcze nie wysłano faktur')),
                    react_1.default.createElement(CommonComponents_1.MyTooltip, { content: 'Na podstawie faktur wys\u0142anych', placement: 'top' },
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                            react_1.default.createElement("div", null, "Do rozliczenia, z\u0142:"),
                            settlemenData?.remainingValue
                                ? react_1.default.createElement("h5", null, Tools_1.default.formatNumber(settlemenData.remainingValue))
                                : 'Jeszcze nie określono'))),
                react_1.default.createElement(react_bootstrap_1.Row, { className: 'mt-3' },
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 12 },
                        react_1.default.createElement("div", null, "Faktury")),
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 12 },
                        react_1.default.createElement(FilterableTable_1.default, { id: 'invoices', title: '', tableStructure: [
                                { header: 'Numer', objectAttributeToShow: 'number' },
                                { header: 'Sprzedaż', objectAttributeToShow: 'issueDate' },
                                { header: 'status', renderTdBody: (invoice) => react_1.default.createElement(CommonComponents_1.InvoiceStatusBadge, { status: invoice.status }) },
                                { header: 'Wysłano', objectAttributeToShow: 'sentDate' },
                                { header: 'Netto, zł', renderTdBody: renderInvoiceTotaValue },
                                { header: 'Termin płatności', objectAttributeToShow: 'paymentDeadline' },
                            ], initialObjects: invoices, repository: ContractsController_1.invoicesRepository, selectedObjectRoute: '/invoice/', isDeletable: false, externalUpdate: invoices.length })))),
            react_1.default.createElement("p", { className: 'tekst-muted small' },
                "Koordynator(ka): ",
                renderCoordinatorData(),
                react_1.default.createElement("br", null),
                "Aktualizacja: ",
                ToolsDate_1.default.timestampToString(contract._lastUpdated)))));
}
exports.default = ContractOurDetails;
