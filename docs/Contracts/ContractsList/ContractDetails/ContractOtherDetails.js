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
const ToolsDate_1 = __importDefault(require("../../../React/ToolsDate"));
const ContractsController_1 = require("../ContractsController");
const ContractDetailsContext_1 = require("./ContractDetailsContext");
function ContractOtherDetails() {
    const { contract, setContract, contractsRepository } = (0, ContractDetailsContext_1.useContractDetails)();
    const [settlemenData, setSettlemenData] = (0, react_1.useState)(undefined);
    const [invoices, setInvoices] = (0, react_1.useState)(undefined);
    if (!contract)
        return react_1.default.createElement(react_bootstrap_1.Alert, { variant: 'danger' }, "Nie wybrano umowy");
    //fetch data
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            if (!contract?.id)
                throw new Error('Nie kontraktu');
            const params = { id: contract.id.toString() };
            const fetchSettlementData = (await ContractsController_1.contractsSettlementRepository.loadItemsFromServer(params))[0];
            const fetchInvoicesData = (await ContractsController_1.invoicesRepository.loadItemsFromServer(params));
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
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            react_1.default.createElement(react_bootstrap_1.Container, null,
                react_1.default.createElement(react_bootstrap_1.Row, null, contract._contractors &&
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 12, md: 8 },
                        react_1.default.createElement("div", null, "Wykonawcy:"),
                        react_1.default.createElement("h5", null, contract._contractors.map((contractor) => react_1.default.createElement("span", null, contractor.name))))),
                react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, null, contract.description && react_1.default.createElement("p", null,
                        "Opis: ",
                        contract.description)))),
            react_1.default.createElement("p", { className: 'tekst-muted small' },
                "Aktualizacja: ",
                ToolsDate_1.default.timestampToString(contract._lastUpdated)))));
}
exports.default = ContractOtherDetails;
