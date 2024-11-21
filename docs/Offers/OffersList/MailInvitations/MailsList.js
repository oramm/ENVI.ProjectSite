"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FilterableTable_1 = __importDefault(require("../../../View/Resultsets/FilterableTable/FilterableTable"));
const OffersController_1 = require("../OffersController");
const MailsFilterBody_1 = require("./MailsFilterBody");
function MailsList() {
    function renderTdBody(dataItem) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null,
                "Od: ",
                react_1.default.createElement("strong", null, dataItem.from),
                ", Do ",
                react_1.default.createElement("strong", null, dataItem.to),
                " Otrzymano: ",
                dataItem.date),
            react_1.default.createElement("div", null,
                "Temat: ",
                dataItem.subject),
            react_1.default.createElement("div", null, dataItem.body)));
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "invitationMails", tableStructure: [{ header: undefined, renderTdBody }], AddNewButtonComponents: [], isDeletable: true, repository: OffersController_1.mailInvitationsRepository, FilterBodyComponent: MailsFilterBody_1.MailsFilterBody }));
}
exports.default = MailsList;
