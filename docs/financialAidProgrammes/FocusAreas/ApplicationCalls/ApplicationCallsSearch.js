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
const ApplicationCallsController_1 = require("./ApplicationCallsController");
const ApplicationCallFilterBody_1 = require("./ApplicationCallFilterBody");
const ApplicationCallModalButtons_1 = require("./Modals/ApplicationCallModalButtons");
function ApplicationCallsSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    function renderFocusArea(applicationCall) {
        return react_1.default.createElement(react_1.default.Fragment, null, applicationCall._focusArea.name);
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "application-calls", title: title, FilterBodyComponent: ApplicationCallFilterBody_1.ApplicationCallsFilterBody, tableStructure: [
            { header: "Opis", objectAttributeToShow: "description" },
            { header: "URL", objectAttributeToShow: "url" },
            { header: "Data rozpoczęcia", objectAttributeToShow: "startDate" },
            { header: "Data zakończenia", objectAttributeToShow: "endDate" },
            { header: "Status", objectAttributeToShow: "status" },
            { header: "Obszar interwencji", renderTdBody: renderFocusArea },
        ], AddNewButtonComponents: [ApplicationCallModalButtons_1.ApplicationCallAddNewModalButton], EditButtonComponent: ApplicationCallModalButtons_1.ApplicationCallEditModalButton, isDeletable: true, repository: ApplicationCallsController_1.applicationCallsRepository, selectedObjectRoute: "/applicationCall/" }));
}
exports.default = ApplicationCallsSearch;
