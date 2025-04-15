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
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const ToolsDate_1 = __importDefault(require("../../React/ToolsDate"));
const MilestoneDatesController_1 = require("./MilestoneDatesController");
const MilestoneDateButtons_1 = require("./Modals/MilestoneDateButtons");
const MilestoneDatesFilterBody_1 = require("./MilestoneDatesFilterBody");
function MilestoneDatesSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    function renderRow(item) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            item.id ? item.id : "⚠️ brak ID",
            react_1.default.createElement("h6", null,
                item._milestone?._contract?._ourIdOrNumber_Alias,
                " | ",
                item._milestone?._type.name,
                " ",
                item._milestone?.name || ""),
            react_1.default.createElement("div", { className: "text-muted" }, item._milestone?._contract?.name || "⚠️ Brak nazwy kontraktu"),
            react_1.default.createElement("div", null,
                "Od: ",
                react_1.default.createElement("strong", null, ToolsDate_1.default.dateISOToDMY(item.startDate)),
                " do",
                " ",
                react_1.default.createElement("strong", null, ToolsDate_1.default.dateISOToDMY(item.endDate))),
            react_1.default.createElement("div", { className: "text-secondary small" },
                "Ostatnia aktualizacja: ",
                ToolsDate_1.default.dateToDDmmmYYYYHHMM(item.lastUpdated))));
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "milestone-dates", title: title, FilterBodyComponent: MilestoneDatesFilterBody_1.MilestoneDatesFilterBody, tableStructure: [{ header: "Zakres czasowy", renderTdBody: renderRow }], AddNewButtonComponents: [], EditButtonComponent: MilestoneDateButtons_1.MilestoneDateEditModalButton, isDeletable: true, repository: MilestoneDatesController_1.milestoneDatesRepository, selectedObjectRoute: "/milestonedate/" }));
}
exports.default = MilestoneDatesSearch;
