"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FilterableTable_1 = __importDefault(require("../../../View/Resultsets/FilterableTable/FilterableTable"));
const OffersController_1 = require("../OffersController");
const MailsModalButtons_1 = require("./Modals/MailsModalButtons");
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const react_bootstrap_1 = require("react-bootstrap");
const FilterableTableContext_1 = require("../../../View/Resultsets/FilterableTable/FilterableTableContext");
const MailModalBodiesPartial_1 = require("./Modals/MailModalBodiesPartial");
const MailValidationSchema_1 = require("./Modals/MailValidationSchema");
const MailInvitationsFilterBody_1 = require("./MailInvitationsFilterBody");
function MailInvitationsList() {
    function renderRowContent(dataItem, isActive = false) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null,
                "Od: ",
                react_1.default.createElement("strong", null, dataItem.from),
                ", Do ",
                react_1.default.createElement("strong", null, dataItem.to),
                " Otrzymano: ",
                dataItem.date,
                " ",
                renderStatus(dataItem)),
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
                    react_1.default.createElement("div", { dangerouslySetInnerHTML: { __html: dataItem.body?.substring(0, 300) + "..." } })),
                react_1.default.createElement("div", { className: "mt-2 mb-2" }, renderMenu())))));
    }
    function renderStatus(dataItem) {
        if (!dataItem.status)
            return react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" }, "Brak statusu");
        const { handleEditObject } = (0, FilterableTableContext_1.useFilterableTableContext)();
        return (react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                initialData: dataItem,
                modalTitle: "Edycja statusu",
                repository: OffersController_1.mailInvitationsRepository,
                ModalBodyComponent: MailModalBodiesPartial_1.MailModalBodyStatus,
                onEdit: handleEditObject,
                fieldsToUpdate: ["status"],
                makeValidationSchema: MailValidationSchema_1.makeMailStatusValidationSchema,
            } },
            react_1.default.createElement(CommonComponents_1.OfferInvitationMailStatusBadge, { status: dataItem.status })));
    }
    function renderMenu() {
        return react_1.default.createElement(MailsModalButtons_1.AddNewOfferButton, { onError: () => { } });
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(FilterableTable_1.default, { id: "mailInvitations", tableStructure: [{ header: undefined, renderTdBody: renderRowContent }], AddNewButtonComponents: [], isDeletable: true, repository: OffersController_1.mailInvitationsRepository, FilterBodyComponent: MailInvitationsFilterBody_1.MailInvitationsFilterBody })));
}
exports.default = MailInvitationsList;
