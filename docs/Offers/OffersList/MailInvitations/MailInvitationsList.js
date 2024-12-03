"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FilterableTable_1 = __importDefault(require("../../../View/Resultsets/FilterableTable/FilterableTable"));
const OffersController_1 = require("../OffersController");
const MailsFilterBody_1 = require("./MailsFilterBody");
const MailsModalButtons_1 = require("./MailsModalButtons");
function MailInvitationsList() {
    function renderRowContent(dataItem, isActive = false) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
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
            "Pierwsze 500 znak\u00F3w maila:",
            react_1.default.createElement("div", { style: {
                    maxWidth: "800px",
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap", // Obsługa nowych linii w tekście
                }, dangerouslySetInnerHTML: { __html: dataItem.body?.substring(0, 300) + "..." } }),
            isActive && renderMenu()));
    }
    function renderMenu() {
        return react_1.default.createElement(MailsModalButtons_1.SetAsGoodToOfferButton, { onError: () => { } });
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(FilterableTable_1.default, { id: "mailInvitations", tableStructure: [{ header: undefined, renderTdBody: renderRowContent }], AddNewButtonComponents: [], isDeletable: true, repository: OffersController_1.mailInvitationsRepository, FilterBodyComponent: MailsFilterBody_1.MailsFilterBody })));
}
exports.default = MailInvitationsList;
