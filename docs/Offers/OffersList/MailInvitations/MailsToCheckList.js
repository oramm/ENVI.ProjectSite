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
const FilterableTable_1 = __importDefault(require("../../../View/Resultsets/FilterableTable/FilterableTable"));
const OffersController_1 = require("../OffersController");
const MailsToCheckFilterBody_1 = require("./MailsToCheckFilterBody");
const MailsModalButtons_1 = require("./Modals/MailsModalButtons");
const react_bootstrap_1 = require("react-bootstrap");
function MailsToCheckList({ show, handleClose }) {
    const [activeMailBody, setActiveMailBody] = (0, react_1.useState)("");
    const [activeMailId, setActiveMailId] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            if (!activeMailId)
                return;
            setActiveMailBody("Ładuję dane...");
            const response = await OffersController_1.mailsToCheckRepository.loadCurrentItemDetailsFromServerPOST("getEmailDetails");
            OffersController_1.mailsToCheckRepository.replaceCurrentItemById(response.id, response);
            OffersController_1.mailsToCheckRepository.replaceItemById(response.id, response);
            setActiveMailBody(response.body || "treść maila nie została pobrana");
        }
        fetchData();
    }, [activeMailId]);
    function handleRowClick(dataItem) {
        if (activeMailId !== dataItem.id) {
            setActiveMailId(dataItem.id);
        }
    }
    function renderRowContent(dataItem, isActive = false) {
        return (react_1.default.createElement("div", { onClick: () => handleRowClick(dataItem) },
            react_1.default.createElement("div", null,
                "Od: ",
                react_1.default.createElement("strong", null, dataItem.from),
                ", Do ",
                react_1.default.createElement("strong", null, dataItem.to),
                " Otrzymano: ",
                dataItem.date),
            react_1.default.createElement("div", { className: "mb-1" },
                "Temat: ",
                dataItem.subject),
            isActive && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("div", { style: {
                        marginLeft: "10px",
                        padding: "10px",
                        borderLeft: "solid 2pt rgb(241 146 146)",
                        backgroundColor: "#ebf5f0",
                        wordWrap: "break-word",
                        whiteSpace: "pre-wrap", // Obsługa nowych linii w tekście
                    } },
                    react_1.default.createElement("p", null, "Pierwsze 500 znak\u00F3w maila:"),
                    react_1.default.createElement("div", { dangerouslySetInnerHTML: { __html: activeMailBody?.substring(0, 300) + "..." } })),
                activeMailBody !== "Ładuję dane..." && react_1.default.createElement("div", { className: "mt-2 mb-2" }, renderMenu())))));
    }
    function renderMenu() {
        return react_1.default.createElement(MailsModalButtons_1.SetAsGoodToOfferButton, { onError: () => { } });
    }
    return (react_1.default.createElement(react_bootstrap_1.Modal, { size: "xl", show: show, onHide: handleClose, onClick: (e) => e.stopPropagation(), onDoubleClick: (e) => e.stopPropagation() },
        react_1.default.createElement(react_bootstrap_1.Modal.Header, { closeButton: true },
            react_1.default.createElement(react_bootstrap_1.Modal.Title, null, "Lista maili do sprawdzenia")),
        react_1.default.createElement(FilterableTable_1.default, { id: "mailsTocheck", tableStructure: [{ header: undefined, renderTdBody: renderRowContent }], AddNewButtonComponents: [], isDeletable: true, repository: OffersController_1.mailsToCheckRepository, FilterBodyComponent: MailsToCheckFilterBody_1.MailsToCheckFilterBody }),
        react_1.default.createElement(react_bootstrap_1.Modal.Footer, null,
            react_1.default.createElement(react_bootstrap_1.Button, { variant: "secondary", onClick: handleClose }, "Zamknij"))));
}
exports.default = MailsToCheckList;
