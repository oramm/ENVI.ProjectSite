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
exports.renderFocusArea = void 0;
const react_1 = __importStar(require("react"));
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const FocusAreasController_1 = require("./FocusAreasController");
const FocusAreasFilterBody_1 = require("./FocusAreasFilterBody");
const FocusAreaModalButtons_1 = require("./Modals/FocusAreaModalButtons");
const FinancialAidProgrammesSearch_1 = require("../Programmes/FinancialAidProgrammesSearch");
function FocusAreasSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    return (react_1.default.createElement(FilterableTable_1.default, { id: "focus-areas", title: title, FilterBodyComponent: FocusAreasFilterBody_1.FocusAreasFilterBody, tableStructure: [
            {
                header: "Program",
                renderTdBody: (focusArea) => (0, FinancialAidProgrammesSearch_1.renderFinancialAidProgramme)(focusArea._financialAidProgramme),
            },
            { header: "Działanie", renderTdBody: renderFocusArea },
        ], AddNewButtonComponents: [FocusAreaModalButtons_1.FocusAreaAddNewModalButton], EditButtonComponent: FocusAreaModalButtons_1.FocusAreaEditModalButton, isDeletable: true, repository: FocusAreasController_1.focusAreasRepository, selectedObjectRoute: "/focusArea/" }));
}
exports.default = FocusAreasSearch;
function renderFocusArea(focusArea) {
    if (!focusArea)
        return react_1.default.createElement(react_1.default.Fragment, null);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", null, focusArea.name),
        react_1.default.createElement("div", { className: "text-muted" }, focusArea.description)));
}
exports.renderFocusArea = renderFocusArea;
