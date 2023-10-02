"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Tools_1 = __importDefault(require("../../../React/Tools"));
const ToolsDate_1 = __importDefault(require("../../../React/ToolsDate"));
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../View/Resultsets/FilterableTable/FilterableTable"));
const ContractsController_1 = require("../ContractsController");
const SecurityModalButtons_1 = require("./Modals/SecurityModalButtons");
const SecuritiesFilterBody_1 = require("./SecuritiesFilterBody");
function renderValue(value) {
    if (value === undefined)
        return react_1.default.createElement(react_1.default.Fragment, null);
    const formatedValue = Tools_1.default.formatNumber(value);
    return react_1.default.createElement("div", { className: "text-end" }, formatedValue);
}
function renderType(isCash) {
    return react_1.default.createElement(react_1.default.Fragment, null, isCash ? 'Gotówka' : 'Gwarancja');
}
function renderFirstPartExpiryDate(security) {
    if (!security.firstPartExpiryDate)
        return react_1.default.createElement(react_1.default.Fragment, null, security._contract.startDate);
    const daysLeft = ToolsDate_1.default.countDaysLeftTo(security.firstPartExpiryDate);
    return react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", null, security.firstPartExpiryDate),
        daysLeft < 30 ? react_1.default.createElement("div", null,
            react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft })) : '');
}
function renderSecondPartExpiryDate(security) {
    if (!security.secondPartExpiryDate)
        return react_1.default.createElement(react_1.default.Fragment, null, security._contract.guaranteeEndDate || 'Sprawdź w umowie');
    const daysLeft = ToolsDate_1.default.countDaysLeftTo(security.secondPartExpiryDate);
    return react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", null, security.secondPartExpiryDate),
        daysLeft < 30 ? react_1.default.createElement("div", null,
            react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft })) : '');
}
function renderDescription(security) {
    if (!security.description)
        return react_1.default.createElement(react_1.default.Fragment, null);
    return react_1.default.createElement(react_1.default.Fragment, null, security.description);
}
function SecuritiesSearch({ title }) {
    return (react_1.default.createElement(FilterableTable_1.default, { id: 'securities', title: title, FilterBodyComponent: SecuritiesFilterBody_1.SecuritiesFilterBody, tableStructure: [
            { header: 'Typ', renderTdBody: (security) => renderType(security.isCash) },
            { header: 'Oznaczenie', renderTdBody: (security) => react_1.default.createElement(react_1.default.Fragment, null, security._contract.ourId) },
            { header: 'Wartość', renderTdBody: (security) => renderValue(security.value) },
            { header: 'Zwrócono', renderTdBody: (security) => renderValue(security.returnedValue) },
            { header: 'Do zwrotu', renderTdBody: (security) => renderValue(security._remainingValue) },
            { header: '70% Wygasa', renderTdBody: (security) => renderFirstPartExpiryDate(security) },
            { header: '30% Wygasa', renderTdBody: (security) => renderSecondPartExpiryDate(security) },
            { header: 'Uwagi', renderTdBody: (security) => renderDescription(security) },
        ], AddNewButtonComponents: [SecurityModalButtons_1.SecurityCashAddNewModalButton, SecurityModalButtons_1.SecurityGuaranteeAddNewModalButton], EditButtonComponent: SecurityModalButtons_1.SecurityEditModalButton, isDeletable: true, repository: ContractsController_1.securitiesRepository, selectedObjectRoute: '/contract/' }));
}
exports.default = SecuritiesSearch;
