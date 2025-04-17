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
exports.renderfinancialAidProgrammeLink = exports.renderFinancialAidProgramme = void 0;
const react_1 = __importStar(require("react"));
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const FinancialAidProgrammesController_1 = require("../FinancialAidProgrammesController");
const FinancialAidProgrammeFilterBody_1 = require("./FinancialAidProgrammeFilterBody");
const FinancialAidProgrammeModalButtons_1 = require("./Modals/FinancialAidProgrammeModalButtons");
function FinancialAidProgrammesSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    return (react_1.default.createElement(FilterableTable_1.default, { id: "financialAidProgrammes", title: title, FilterBodyComponent: FinancialAidProgrammeFilterBody_1.FinancialAidProgrammesFilterBody, tableStructure: [{ header: "Program", renderTdBody: renderFinancialAidProgramme }], AddNewButtonComponents: [FinancialAidProgrammeModalButtons_1.FinancialAidProgrammeAddNewModalButton], EditButtonComponent: FinancialAidProgrammeModalButtons_1.FinancialAidProgrammeEditModalButton, isDeletable: true, repository: FinancialAidProgrammesController_1.financialAidProgrammesRepository, selectedObjectRoute: "/FinancialAidProgramme/" }));
}
exports.default = FinancialAidProgrammesSearch;
function renderFinancialAidProgramme(financialAidProgramme) {
    if (!financialAidProgramme)
        return react_1.default.createElement(react_1.default.Fragment, null);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", null, renderfinancialAidProgrammeLink(financialAidProgramme)),
        react_1.default.createElement("div", null, financialAidProgramme.name),
        react_1.default.createElement("div", { className: "text-muted" }, financialAidProgramme.description)));
}
exports.renderFinancialAidProgramme = renderFinancialAidProgramme;
function renderfinancialAidProgrammeLink(financialAidProgramme) {
    if (!financialAidProgramme.url)
        return react_1.default.createElement(react_1.default.Fragment, null, financialAidProgramme.alias);
    return (react_1.default.createElement("a", { href: financialAidProgramme.url, target: "_blank", rel: "noreferrer", className: "text-primary text-decoration-none" }, financialAidProgramme.alias));
}
exports.renderfinancialAidProgrammeLink = renderfinancialAidProgrammeLink;
