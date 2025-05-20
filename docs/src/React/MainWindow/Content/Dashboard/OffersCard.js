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
const MainSetupReact_1 = __importDefault(require("../../../MainSetupReact"));
const MainWindowController_1 = require("../../MainWindowController");
const ToolsDate_1 = __importDefault(require("../../../Tools/ToolsDate"));
const statusIcons = {
    "Składamy czy nie?": "❓",
    "Do złożenia": "📝",
    "Czekamy na wynik": "⏳",
    Wygrana: "🏆",
    Przegrana: "❌",
    Wycofana: "🔙",
    Unieważnione: "🚫",
    "Nie składamy": "🛑",
};
function OffersCard({ className }) {
    const [expandedStatus, setExpandedStatus] = (0, react_1.useState)({});
    const [dataLoaded, setDataLoaded] = (0, react_1.useState)(false);
    const [data, setData] = (0, react_1.useState)(undefined);
    const submissionDeadlineFrom = ToolsDate_1.default.addDays(new Date(), -90).toISOString().slice(0, 10);
    const submissionDeadlineTo = ToolsDate_1.default.addDays(new Date(), 30).toISOString().slice(0, 10);
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            setDataLoaded(false);
            const offers = await MainWindowController_1.offersRepository.loadItemsFromServerPOST([
                {
                    statuses: Object.values(MainSetupReact_1.default.OfferStatus),
                    submissionDeadlineFrom,
                    submissionDeadlineTo,
                },
            ]);
            setData(offers);
            setDataLoaded(true);
        }
        fetchData();
    }, []);
    function renderOfferStatusSection(params) {
        const { sectionData, status, expanded, onToggle } = params;
        const INITIAL_VISIBLE = 0;
        const visibleData = expanded ? sectionData : sectionData.slice(0, INITIAL_VISIBLE);
        return (react_1.default.createElement(react_bootstrap_1.ListGroup.Item, { key: status, className: "p-0 border-0" },
            react_1.default.createElement("div", { className: "d-flex align-items-center list-group-item-action", onClick: onToggle },
                react_1.default.createElement("span", { className: "d-flex align-items-center flex-grow-1", style: { cursor: "pointer" } },
                    react_1.default.createElement("span", { style: { fontSize: 14, width: 14 } }, statusIcons[status]),
                    react_1.default.createElement("span", { className: "ms-2 fw-semibold" }, status)),
                react_1.default.createElement("span", { className: "d-flex align-items-center" },
                    react_1.default.createElement(react_bootstrap_1.Badge, { bg: "light", text: "dark" }, sectionData.length),
                    react_1.default.createElement("span", { className: "text-secondary small ms-2", style: { fontSize: "0.9em" } }, expanded ? "▼" : "▸"))),
            react_1.default.createElement("ul", { className: "ps-4 mt-2 mb-2", style: { listStyleType: "none" } }, visibleData.map((offer, i) => renderOfferListItem(offer)))));
    }
    function renderOfferListItem(offer) {
        return (react_1.default.createElement("li", { key: `${offer.id}` },
            react_1.default.createElement("span", { className: "text-secondary small" },
                react_1.default.createElement("span", { className: "fw-semibold" }, offer._city.name),
                ", ",
                offer._type.name,
                ",",
                " ",
                react_1.default.createElement("span", { className: "fw-light" }, offer.alias))));
    }
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString("pl-PL", { day: "2-digit", month: "short" });
    }
    function renderCardTitle() {
        return (react_1.default.createElement("div", { className: "d-flex justify-content-between align-items-center" },
            react_1.default.createElement(react_bootstrap_1.Card.Title, { className: "mb-0" }, "Oferty"),
            react_1.default.createElement("span", { style: { fontSize: "0.85em" }, className: "text-secondary" },
                formatDate(submissionDeadlineFrom),
                " - ",
                formatDate(submissionDeadlineTo))));
    }
    function handleToggle(status) {
        setExpandedStatus((prev) => ({
            ...prev,
            [status]: !prev[status],
        }));
    }
    if (!dataLoaded) {
        return (react_1.default.createElement(react_bootstrap_1.Card, { className: className },
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Card.Title, null, "Oferty"),
                react_1.default.createElement("div", { className: "text-center" },
                    react_1.default.createElement("span", { className: "spinner-border spinner-border-sm", role: "status", "aria-hidden": "true" })))));
    }
    if (!data || data.length === 0) {
        return (react_1.default.createElement(react_bootstrap_1.Card, { className: className },
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Card.Title, null, "Oferty"),
                react_1.default.createElement("div", { className: "text-center" },
                    react_1.default.createElement("span", { className: "text-secondary" }, "Brak ofert do wy\u015Bwietlenia")))));
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, { className: className },
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            renderCardTitle(),
            react_1.default.createElement(react_bootstrap_1.ListGroup, { variant: "flush", className: "mt-3" }, Object.values(MainSetupReact_1.default.OfferStatus).map((status) => {
                const offersInStatus = data.filter((o) => o.status === status);
                if (offersInStatus.length === 0)
                    return null;
                return renderOfferStatusSection({
                    sectionData: offersInStatus,
                    status,
                    expanded: expandedStatus[status] || false,
                    onToggle: () => handleToggle(status),
                });
            })))));
}
exports.default = OffersCard;
