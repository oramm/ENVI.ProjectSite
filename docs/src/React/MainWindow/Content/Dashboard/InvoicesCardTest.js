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
const MainSetupReact_1 = __importDefault(require("../../../MainSetupReact"));
const MainWindowController_1 = require("../../MainWindowController");
const ToolsDate_1 = __importDefault(require("../../../Tools/ToolsDate"));
const Tools_1 = __importDefault(require("../../../Tools/Tools"));
const DashboardCard_1 = __importDefault(require("../../../../View/Resultsets/DashboardCard/DashboardCard"));
const InvoiceModalButtons_1 = require("../../../../Erp/InvoicesList/Modals/InvoiceModalButtons");
const invoiceStatusIcons = {
    "Na później": "⏳",
    "Do zrobienia": "📝",
    Zrobiona: "✅",
    Wysłana: "📤",
    Zapłacona: "💸",
    "Do korekty": "✏️",
    Wycofana: "🚫",
};
function InvoicesCardNEW({ className }) {
    const [dataLoaded, setDataLoaded] = (0, react_1.useState)(false);
    const [data, setData] = (0, react_1.useState)([]);
    const [cardData, setCardData] = (0, react_1.useState)({
        header: { title: "", daysBeforeToday: 30, daysAfterToday: 14 },
        sections: [],
        sectionAttributeName: "status",
    });
    // Przykład zakresu dat – podmień na logikę pod projekt!
    const issueDateFrom = ToolsDate_1.default.addDays(new Date(), -60).toISOString().slice(0, 10);
    const issueDateTo = ToolsDate_1.default.addDays(new Date(), 30).toISOString().slice(0, 10);
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            setDataLoaded(false);
            const invoices = (await MainWindowController_1.invoicesRepository.loadItemsFromServerPOST([
                {
                    statuses: Object.values(MainSetupReact_1.default.InvoiceStatuses),
                    issueDateFrom,
                    issueDateTo,
                },
            ]));
            setData(invoices);
            setDataLoaded(true);
        }
        fetchData();
    }, []);
    (0, react_1.useEffect)(() => {
        if (dataLoaded && data.length > 0) {
            const uniqueStatuses = Array.from(new Set(data.map((inv) => inv.status)));
            const cardSections = uniqueStatuses.map((status) => ({
                icon: invoiceStatusIcons[status] || "📄",
                key: status,
                label: status,
            }));
            setCardData({
                header: {
                    title: "Faktury",
                    daysBeforeToday: 60,
                    daysAfterToday: 30,
                },
                sections: cardSections,
                sectionAttributeName: "status",
            });
        }
    }, [dataLoaded, data]);
    function renderItemSubtitle({ sectionData }) {
        const invoicesInSection = data.filter((inv) => inv.status === sectionData.key);
        const totalValue = Tools_1.default.formatNumber(getTotalValue(invoicesInSection)) + " zł";
        return react_1.default.createElement("span", null,
            "\u0141\u0105cznie: ",
            totalValue);
    }
    function renderListItem({ object }) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("span", { className: "text-secondary small flex-grow-1" },
                react_1.default.createElement("span", { className: "fw-semibold" }, object._contract.ourId),
                ", ",
                object.number || object._contract._city?.name),
            react_1.default.createElement("span", { className: "text-secondary small text-end ms-2", style: { minWidth: 70 } },
                react_1.default.createElement("span", { className: "fw-light" },
                    Tools_1.default.formatNumber(object._totalNetValue || 0),
                    " z\u0142"))));
    }
    function getTotalValue(invoices = []) {
        return invoices.reduce((acc, inv) => {
            // Zamieni wszystko (number, undefined, string) na string, więc replace zawsze istnieje
            const raw = inv._totalNetValue;
            const num = parseFloat(String(raw).replace(",", "."));
            return acc + (isNaN(num) ? 0 : num);
        }, 0);
    }
    return (react_1.default.createElement(DashboardCard_1.default, { cardData: cardData, dataLoaded: dataLoaded, initialObjects: data, repository: MainWindowController_1.invoicesRepository, ListItem: renderListItem, SectionSubtittle: renderItemSubtitle, className: className, isDeletable: false, EditButtonComponent: InvoiceModalButtons_1.InvoiceEditModalButton, shouldRetrieveDataBeforeEdit: false }));
}
exports.default = InvoicesCardNEW;
