"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FilterableTable_1 = __importDefault(require("../../../View/Resultsets/FilterableTable/FilterableTable"));
const OffersController_1 = require("../OffersController");
function MailsList() {
    return (react_1.default.createElement(FilterableTable_1.default, { id: "invitationMails", tableStructure: [{ header: undefined, renderTdBody: (dataItem) => react_1.default.createElement(react_1.default.Fragment, null, "Test") }], AddNewButtonComponents: [], isDeletable: true, repository: OffersController_1.offersRepository, selectedObjectRoute: "/offer/" }));
}
exports.default = MailsList;
