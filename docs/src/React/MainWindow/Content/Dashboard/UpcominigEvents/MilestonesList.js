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
const react_bootstrap_1 = require("react-bootstrap");
const GeneralModalButtons_1 = require("../../../../../View/Modals/GeneralModalButtons");
const CommonComponents_1 = require("../../../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../../../View/Resultsets/FilterableTable/FilterableTable"));
const MainSetupReact_1 = __importDefault(require("../../../../MainSetupReact"));
const Tools_1 = __importDefault(require("../../../../Tools/Tools"));
const ToolsDate_1 = __importDefault(require("../../../../Tools/ToolsDate"));
const MainWindowController_1 = require("../../../MainWindowController");
const MilestoneDateBodiesPartial_1 = require("../../../../../Contracts/Dates/Modals/MilestoneDateBodiesPartial");
const FilterableTableContext_1 = require("../../../../../View/Resultsets/FilterableTable/FilterableTableContext");
const typeGuards_1 = require("../../../../../../Typings/typeGuards");
const MilestoneDateButtons_1 = require("../../../../../Contracts/Dates/Modals/MilestoneDateButtons");
function MilestonesList() {
    const [milestoneDates, setMilestoneDates] = (0, react_1.useState)([]);
    const [sections, setSections] = (0, react_1.useState)([]);
    const [externalUpdate, setExternalUpdate] = (0, react_1.useState)(0);
    const [dataLoaded, setDataLoaded] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        document.title = "Główna";
    }, []);
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            setDataLoaded(false);
            const endDateTo = ToolsDate_1.default.addDays(new Date(), -130);
            const milestones = await MainWindowController_1.milestoneDatesRepository.loadItemsFromServerPOST([
                {
                    milestoneStatuses: [MainSetupReact_1.default.MilestoneStatus.IN_PROGRESS, MainSetupReact_1.default.MilestoneStatus.NOT_STARTED],
                    endDateTo: endDateTo.toISOString().slice(0, 10),
                    getRemainingValue: true,
                    _admin: filterByCurrentUser() ? MainSetupReact_1.default.getCurrentUserAsPerson() : undefined,
                },
            ]);
            setMilestoneDates(milestones);
            setDataLoaded(true);
        }
        fetchData();
    }, []);
    (0, react_1.useEffect)(() => {
        const ourMilestones = milestoneDates.filter((m) => m._milestone?._contract?._type.isOur);
        const otherMilestones = milestoneDates.filter((m) => !m._milestone?._contract?._type.isOur);
        setSections(buildTree(ourMilestones, otherMilestones));
        setExternalUpdate((prevState) => prevState + 1);
    }, [milestoneDates]);
    /**
     * Filtrowanie będzie tylko dla użytkowników z uprawnieniami poniżej ENVI_MANAGER i ADMIN
     */
    function filterByCurrentUser() {
        const privilegedRoles = [MainSetupReact_1.default.SystemRoles.ADMIN.systemName, MainSetupReact_1.default.SystemRoles.ENVI_MANAGER.systemName];
        return !privilegedRoles.includes(MainSetupReact_1.default.currentUser.systemRoleName);
    }
    function renderRow(item) {
        if (!item.id)
            return react_1.default.createElement(react_1.default.Fragment, null, "\"\u26A0\uFE0F brak ID\"");
        const _contract = item._milestone?._contract;
        const _milestone = item._milestone;
        let contractLabel = `${_contract?._ourIdOrNumber_Alias} ` || " ";
        if ((0, typeGuards_1.isOurContract)(_contract))
            contractLabel += _contract?._type?.name;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null,
                contractLabel,
                " ",
                renderContractStatus(item)),
            react_1.default.createElement("div", { className: "mb-2" },
                react_1.default.createElement("span", { className: "small" }, "Kamie\u0144: "),
                react_1.default.createElement("span", { className: "fw-bold me-1" }, _milestone?._type.name),
                " ",
                react_1.default.createElement("span", { className: "me-1" }, _milestone?.name || ""),
                renderMilestoneStatus(item),
                react_1.default.createElement("div", null, renderDates(item)))));
    }
    function renderDates(item) {
        return (react_1.default.createElement("div", { className: "mb-2" },
            react_1.default.createElement("span", { className: "fw-bold" }, "Od:"),
            " ",
            react_1.default.createElement("span", { className: "fs-5" }, ToolsDate_1.default.dateISOToDMY(item.startDate)),
            " ",
            react_1.default.createElement("span", { className: "fw-bold" }, "do:"),
            " ",
            react_1.default.createElement("span", { className: "fs-5" }, ToolsDate_1.default.dateISOToDMY(item.endDate)),
            " ",
            react_1.default.createElement("span", null, renderDaysLeft(item))));
    }
    function renderContractStatus(item) {
        if (!item._milestone?._contract?.status)
            return react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" }, "Brak statusu");
        const { handleEditObject } = (0, FilterableTableContext_1.useFilterableTableContext)();
        return (react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                initialData: item,
                modalTitle: `Edycja statusu kontraktu ${item._milestone?._contract?._ourIdOrNumber_Alias}`,
                repository: MainWindowController_1.milestoneDatesRepository,
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
                repository: MainWindowController_1.milestoneDatesRepository,
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
    function renderRemainingValue(milestoneDate) {
        const _contract = milestoneDate._milestone?._contract;
        if (!_contract)
            return react_1.default.createElement(react_1.default.Fragment, null, "Brak kontraktu");
        const ourId = "ourId" in _contract ? _contract.ourId : "";
        if (!ourId || !_contract._remainingNotIssuedValue || !_contract._remainingNotScheduledValue)
            return react_1.default.createElement(react_1.default.Fragment, null);
        const formatedNotScheduledValue = Tools_1.default.formatNumber(_contract._remainingNotScheduledValue || 0, 0);
        const formatedNotIssuedValue = Tools_1.default.formatNumber(_contract._remainingNotIssuedValue || 0, 0);
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(CommonComponents_1.MyTooltip, { content: "R\u00F3\u017Cnica pomi\u0119dzy warto\u015Bci\u0105 wys\u0142anych faktur a warto\u015Bci\u0105 umowy", placement: "right" },
                react_1.default.createElement("div", { className: "text-end text-success" }, formatedNotIssuedValue)),
            react_1.default.createElement(CommonComponents_1.MyTooltip, { content: "R\u00F3\u017Cnica pomi\u0119dzy warto\u015Bci\u0105 wszystkich  faktur w witrynie a warto\u015Bci\u0105 umowy", placement: "right" },
                react_1.default.createElement("div", { className: "text-end text-danger" }, formatedNotScheduledValue))));
    }
    function makeTablestructure() {
        const tableStructure = [{ renderTdBody: renderRow }];
        const allowedRoles = [MainSetupReact_1.default.SystemRoles.ADMIN.systemName, MainSetupReact_1.default.SystemRoles.ENVI_MANAGER.systemName];
        if (MainSetupReact_1.default.isRoleAllowed(allowedRoles)) {
            tableStructure.push({
                header: "Do rozliczenia",
                renderTdBody: (milestone) => renderRemainingValue(milestone),
            });
        }
        return tableStructure;
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "milestones", title: "", showTableHeader: false, initialSections: sections, tableStructure: makeTablestructure(), isDeletable: false, EditButtonComponent: MilestoneDateButtons_1.MilestoneDateEditModalButton, repository: MainWindowController_1.milestoneDatesRepository, selectedObjectRoute: "/milestone/", externalUpdate: externalUpdate }));
}
exports.default = MilestonesList;
function DateEditTrigger({ date, milestone, onEdit }) {
    return date ? ToolsDate_1.default.dateYMDtoDMY(date) : "Jeszcze nie ustalono";
}
function buildTree(ourMilestoneDates, otherMilestoneDates) {
    const milestoneGroupNodes = [
        {
            id: "milestoneGroupOur",
            isInAccordion: true,
            level: 1,
            type: "milestoneGroup",
            childrenNodesType: "milestone",
            repository: MainWindowController_1.milestoneDatesRepository,
            dataItem: { id: 1 },
            titleLabel: "Kontrakty ENVI",
            children: [],
            leaves: [...ourMilestoneDates],
            isDeletable: false,
        },
        {
            id: "milestoneGroupOther",
            isInAccordion: true,
            level: 1,
            type: "milestoneGroup",
            childrenNodesType: "milestone",
            repository: MainWindowController_1.milestoneDatesRepository,
            dataItem: { id: 2 },
            titleLabel: "Pozostałe kontrakty",
            children: [],
            leaves: [...otherMilestoneDates],
            isDeletable: false,
        },
    ];
    return milestoneGroupNodes;
}
