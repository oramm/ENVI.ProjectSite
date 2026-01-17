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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NeedsSearch;
const react_1 = __importStar(require("react"));
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const NeedsFilterBody_1 = require("./NeedsFilterBody");
const NeedModalButtons_1 = require("./Modals/NeedModalButtons");
const FinancialAidProgrammesController_1 = require("../FinancialAidProgrammesController");
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const ApplicationCallsSearch_1 = require("../FocusAreas/ApplicationCalls/ApplicationCallsSearch");
const FinancialAidProgrammesSearch_1 = require("../Programmes/FinancialAidProgrammesSearch");
const FocusAreasSearch_1 = require("../FocusAreas/FocusAreasSearch");
function NeedsSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    function renderNeedData(need) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null,
                need.name,
                " ",
                (0, CommonComponents_1.ClientNeedStatusBadge)({ status: need.status })),
            react_1.default.createElement("div", { className: "text-muted" }, need.description)));
    }
    function renderClient(need) {
        return react_1.default.createElement(react_1.default.Fragment, null, need._client.name);
    }
    function renderApplicationCallWithContext(need) {
        if (!need._applicationCall)
            return react_1.default.createElement(react_1.default.Fragment, null);
        return (react_1.default.createElement(react_1.default.Fragment, null,
            (0, FinancialAidProgrammesSearch_1.renderFinancialAidProgramme)(need._applicationCall._focusArea._financialAidProgramme),
            (0, FocusAreasSearch_1.renderFocusArea)(need._applicationCall._focusArea),
            (0, ApplicationCallsSearch_1.renderApplicationCall)(need._applicationCall)));
    }
    function renderFocusAreas(need) {
        if (need._focusAreas && need._focusAreas.length > 0) {
            return (react_1.default.createElement("ul", null, need._focusAreas.map((focusArea, index) => (react_1.default.createElement("li", { key: index }, (0, FocusAreasSearch_1.renderFocusArea)(focusArea))))));
        }
        if (need._focusAreasNames && need._focusAreasNames.length > 0) {
            return (react_1.default.createElement("ul", null, need._focusAreasNames.map((focusAreaName, index) => (react_1.default.createElement("li", { key: index }, focusAreaName)))));
        }
        return react_1.default.createElement(react_1.default.Fragment, null);
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "needs", title: title, FilterBodyComponent: NeedsFilterBody_1.NeedsFilterBody, tableStructure: [
            { header: "Potrzeba", renderTdBody: renderNeedData, colMd: 3 },
            { header: "Klient", renderTdBody: renderClient, colMd: 2 },
            { header: "Przypisane działania", renderTdBody: renderFocusAreas, colMd: 3 },
            {
                header: "Przypisany nabór",
                renderTdBody: renderApplicationCallWithContext,
                colMd: 3,
            },
        ], AddNewButtonComponents: [NeedModalButtons_1.NeedAddNewModalButton], EditButtonComponent: NeedModalButtons_1.NeedEditModalButton, isDeletable: true, repository: FinancialAidProgrammesController_1.needsRepository, selectedObjectRoute: "/need/", shouldRetrieveDataBeforeEdit: true }));
}
