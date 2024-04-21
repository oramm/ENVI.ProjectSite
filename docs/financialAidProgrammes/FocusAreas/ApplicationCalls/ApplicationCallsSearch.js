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
exports.renderApplicationCallLink = exports.renderApplicationCall = void 0;
const react_1 = __importStar(require("react"));
const FilterableTable_1 = __importDefault(require("../../../View/Resultsets/FilterableTable/FilterableTable"));
const ApplicationCallsController_1 = require("./ApplicationCallsController");
const ApplicationCallFilterBody_1 = require("./ApplicationCallFilterBody");
const ApplicationCallModalButtons_1 = require("./Modals/ApplicationCallModalButtons");
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const FinancialAidProgrammesSearch_1 = require("../../Programmes/FinancialAidProgrammesSearch");
const FocusAreasSearch_1 = require("../FocusAreasSearch");
function ApplicationCallsSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    return (react_1.default.createElement(FilterableTable_1.default, { id: "application-calls", title: title, FilterBodyComponent: ApplicationCallFilterBody_1.ApplicationCallsFilterBody, tableStructure: [
            {
                header: "Program",
                renderTdBody: (applicationCall) => (0, FinancialAidProgrammesSearch_1.renderFinancialAidProgramme)(applicationCall._focusArea._financialAidProgramme),
            },
            { header: "Działanie", renderTdBody: (applicationCall) => (0, FocusAreasSearch_1.renderFocusArea)(applicationCall._focusArea) },
            { header: "Nabór", renderTdBody: renderApplicationCall },
        ], AddNewButtonComponents: [ApplicationCallModalButtons_1.ApplicationCallAddNewModalButton], EditButtonComponent: ApplicationCallModalButtons_1.ApplicationCallEditModalButton, isDeletable: true, repository: ApplicationCallsController_1.applicationCallsRepository, selectedObjectRoute: "/applicationCall/" }));
}
exports.default = ApplicationCallsSearch;
function renderApplicationCall(applicationCall) {
    if (!applicationCall)
        return react_1.default.createElement(react_1.default.Fragment, null);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", null,
            renderApplicationCallLink(applicationCall) || applicationCall.description,
            " ",
            (0, CommonComponents_1.ApplicationCallStatusBadge)({ status: applicationCall.status })),
        react_1.default.createElement("div", { className: "text-muted" },
            "Od: ",
            applicationCall.startDate,
            " do: ",
            applicationCall.endDate)));
}
exports.renderApplicationCall = renderApplicationCall;
function renderApplicationCallLink(applicationCall) {
    if (!applicationCall.url)
        return null;
    return (react_1.default.createElement("a", { href: applicationCall.url, target: "_blank", rel: "noreferrer", className: "text-primary text-decoration-none" }, applicationCall.description));
}
exports.renderApplicationCallLink = renderApplicationCallLink;
