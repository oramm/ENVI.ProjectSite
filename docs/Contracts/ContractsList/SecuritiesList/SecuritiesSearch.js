"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const Tools_1 = __importDefault(require("../../../React/Tools"));
const ToolsDate_1 = __importDefault(require("../../../React/ToolsDate"));
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
    const daysLeft = countDaysLeftTo(security.firstPartExpiryDate);
    return react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", null, security.firstPartExpiryDate),
        daysLeft < 30 ? react_1.default.createElement("div", null, makeBadge(daysLeft)) : '');
}
function renderSecondPartExpiryDate(security) {
    if (!security.secondPartExpiryDate)
        return react_1.default.createElement(react_1.default.Fragment, null, security._contract.guaranteeEndDate || 'Sprawdź w umowie');
    const daysLeft = countDaysLeftTo(security.secondPartExpiryDate);
    return react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", null, security.secondPartExpiryDate),
        daysLeft < 30 ? react_1.default.createElement("div", null, makeBadge(daysLeft)) : '');
}
function countDaysLeftTo(expiryDate) {
    const today = new Date();
    const expiryDateParsed = new Date(expiryDate);
    const diffDays = ToolsDate_1.default.dateDiff(today.getTime(), expiryDateParsed.getTime());
    return diffDays;
}
function renderDescription(security) {
    if (!security.description)
        return react_1.default.createElement(react_1.default.Fragment, null);
    return react_1.default.createElement(react_1.default.Fragment, null, security.description);
}
function makeBadge(daysLeft) {
    let variant;
    let textMode = 'light';
    if (daysLeft < 10) {
        variant = 'danger';
    }
    else if (daysLeft < 20) {
        variant = 'warning';
        textMode = 'dark';
    }
    else {
        variant = 'success';
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode },
        daysLeft,
        " dni"));
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
