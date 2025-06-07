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
const ToolsDate_1 = __importDefault(require("../../React/Tools/ToolsDate"));
const MilestoneDatesController_1 = require("./MilestoneDatesController");
const MilestoneDateButtons_1 = require("./Modals/MilestoneDateButtons");
const MilestoneDatesFilterBody_1 = require("./MilestoneDatesFilterBody");
const typeGuards_1 = require("../../../Typings/typeGuards");
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const GeneralModalButtons_1 = require("../../View/Modals/GeneralModalButtons");
const MilestoneDateBodiesPartial_1 = require("./Modals/MilestoneDateBodiesPartial");
const FilterableTableContext_1 = require("../../View/Resultsets/FilterableTable/FilterableTableContext");
const react_bootstrap_1 = require("react-bootstrap");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
function MilestoneDatesSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    function renderRow(item) {
        if (!item.id)
            return react_1.default.createElement(react_1.default.Fragment, null, "\"\u26A0\uFE0F brak ID\"");
        const _contract = item._milestone?._contract;
        const _milestone = item._milestone;
        const _admin = (0, typeGuards_1.isOurContract)(_contract) ? _contract?._admin : _contract?._ourContract?._admin;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("div", { className: "mb-2" },
                react_1.default.createElement("span", null,
                    "[",
                    _contract?.projectOurId,
                    "] ",
                    _contract?._ourIdOrNumber_Alias),
                " ",
                "| ",
                react_1.default.createElement("span", { className: "fw-bold" }, _milestone?._type.name),
                " ",
                react_1.default.createElement("span", null, _milestone?.name || ""),
                " ",
                renderMilestoneStatus(item)),
            react_1.default.createElement("div", { className: "mb-2" },
                react_1.default.createElement("div", { className: "text-dark" }, item._milestone?.description),
                react_1.default.createElement("div", { className: "text-muted small" }, item.description)),
            react_1.default.createElement("div", { className: "mb-2 small text-muted" },
                react_1.default.createElement("div", null,
                    "Kontrakt:",
                    " ",
                    react_1.default.createElement("span", { className: "fw-semibold" },
                        "[",
                        _contract?._type?.name,
                        "] ",
                        _contract?.name || "⚠️ Brak nazwy kontraktu"),
                    " ",
                    renderContractStatus(item)),
                react_1.default.createElement("div", null,
                    "Administrator:",
                    " ",
                    react_1.default.createElement("span", { className: "fw-semibold" }, _admin ? `${_admin.name} ${_admin.surname}` : "⚠️ brak administratora"))),
            react_1.default.createElement("div", { className: "mb-2" },
                react_1.default.createElement("span", { className: "fw-bold" }, "Od:"),
                " ",
                react_1.default.createElement("span", { className: "fs-5" }, ToolsDate_1.default.dateISOToDMY(item.startDate)),
                " ",
                react_1.default.createElement("span", { className: "fw-bold" }, "do:"),
                " ",
                react_1.default.createElement("span", { className: "fs-5" }, ToolsDate_1.default.dateISOToDMY(item.endDate)),
                " ",
                react_1.default.createElement("span", null, renderDaysLeft(item))),
            react_1.default.createElement("div", { className: "text-secondary small" },
                "Ostatnia aktualizacja: ",
                ToolsDate_1.default.dateToDDmmmYYYYHHMM(item.lastUpdated))));
    }
    function renderContractStatus(item) {
        if (!item._milestone?._contract?.status)
            return react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" }, "Brak statusu");
        const { handleEditObject } = (0, FilterableTableContext_1.useFilterableTableContext)();
        return (react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                initialData: item,
                modalTitle: `Edycja statusu kontraktu ${item._milestone?._contract?._ourIdOrNumber_Alias}`,
                repository: MilestoneDatesController_1.milestoneDatesRepository,
                ModalBodyComponent: MilestoneDateBodiesPartial_1.ContractModalBodyStatus,
                onEdit: handleEditObject,
                fieldsToUpdate: ["status"],
                specialActionRoute: "milestoneDateContract",
                //makeValidationSchema: contractStatusValidationSchema,
            } },
            react_1.default.createElement(CommonComponents_1.ContractStatusBadge, { status: item._milestone?._contract?.status || "" })));
    }
    function renderMilestoneStatus(item) {
        const { handleEditObject } = (0, FilterableTableContext_1.useFilterableTableContext)();
        return (react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                initialData: item,
                modalTitle: `Edycja statusu kamienia milowego ${item._milestone?._FolderNumber_TypeName_Name}`,
                repository: MilestoneDatesController_1.milestoneDatesRepository,
                ModalBodyComponent: MilestoneDateBodiesPartial_1.MilestoneModalBodyStatus,
                onEdit: handleEditObject,
                fieldsToUpdate: ["status"],
                specialActionRoute: "milestoneDateMilestone",
                //makeValidationSchema: contractStatusValidationSchema,
            } },
            react_1.default.createElement(CommonComponents_1.MilestoneStatusBadge, { status: item._milestone?.status || "" })));
    }
    function renderDaysLeft(item) {
        if (!item._milestone?.status ||
            ![MainSetupReact_1.default.MilestoneStatus.IN_PROGRESS, MainSetupReact_1.default.MilestoneStatus.NOT_STARTED].includes(item._milestone.status))
            return null;
        const daysLeft = ToolsDate_1.default.countDaysLeftTo(item.endDate);
        return react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft });
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "milestone-dates", title: title, showTableHeader: false, FilterBodyComponent: MilestoneDatesFilterBody_1.MilestoneDatesFilterBody, tableStructure: [{ renderTdBody: renderRow }], AddNewButtonComponents: [], EditButtonComponent: MilestoneDateButtons_1.MilestoneDateEditModalButton, isDeletable: true, repository: MilestoneDatesController_1.milestoneDatesRepository, selectedObjectRoute: "/milestonedate/" }));
}
exports.default = MilestoneDatesSearch;
