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
const CommonComponents_1 = require("../../../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../../../View/Resultsets/FilterableTable/FilterableTable"));
const MainSetupReact_1 = __importDefault(require("../../../../MainSetupReact"));
const Tools_1 = __importDefault(require("../../../../Tools"));
const ToolsDate_1 = __importDefault(require("../../../../ToolsDate"));
const MainWindowController_1 = require("../../../MainWindowController");
function MilestonesList() {
    const [milestones, setMilestones] = (0, react_1.useState)([]);
    const [ourMilestones, setOurMilestones] = (0, react_1.useState)([]);
    const [otherMilestones, setOtherMilestones] = (0, react_1.useState)([]);
    const [externalUpdate, setExternalUpdate] = (0, react_1.useState)(0);
    const [dataLoaded, setDataLoaded] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            setDataLoaded(false);
            const endDateTo = ToolsDate_1.default.addDays(new Date(), 30);
            const milestones = (await Promise.all([
                MainWindowController_1.milestonesRepository.loadItemsFromServerPOST([
                    {
                        status: [MainSetupReact_1.default.ContractStatuses.IN_PROGRESS, MainSetupReact_1.default.ContractStatuses.NOT_STARTED],
                        endDateTo: endDateTo.toISOString().slice(0, 10),
                        getRemainingValue: true,
                        _admin: filterByCurrentUser() ? MainSetupReact_1.default.getCurrentUserAsPerson() : undefined,
                    },
                ]),
            ]));
            setMilestones(milestones);
            setOurMilestones(milestones.filter((m) => m._contract?._type.isOur));
            setOtherMilestones(milestones.filter((m) => !m._contract?._type.isOur));
            setExternalUpdate((prevState) => prevState + 1);
            setDataLoaded(true);
        }
        fetchData();
    }, []);
    /**
     * Filtrowanie będzie tylko dla użytkowników z uprawnieniami poniżej ENVI_MANAGER i ADMIN
     */
    function filterByCurrentUser() {
        const privilegedRoles = [MainSetupReact_1.default.SystemRoles.ADMIN.systemName, MainSetupReact_1.default.SystemRoles.ENVI_MANAGER.systemName];
        return !privilegedRoles.includes(MainSetupReact_1.default.currentUser.systemRoleName);
    }
    function renderName(milestone) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_1.default.Fragment, null, milestone.name),
            milestone.status && react_1.default.createElement(CommonComponents_1.ContractStatusBadge, { status: milestone.status })));
    }
    function renderEndDate(milestone) {
        const { endDate } = milestone;
        if (!endDate)
            return react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" }, "Brak daty zako\u0144czenia");
        const daysLeft = ToolsDate_1.default.countDaysLeftTo(endDate);
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null, endDate),
            react_1.default.createElement("div", null,
                react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft }))));
    }
    function renderStartDate(milestone) {
        const { startDate } = milestone;
        if (!startDate)
            return react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" }, "Brak daty rozpocz\u0119cia");
        return react_1.default.createElement("div", null, startDate);
    }
    function handleEditObject(object) {
        setMilestones(milestones.map((o) => (o.id === object.id ? object : o)));
        setExternalUpdate((prevState) => prevState + 1);
    }
    function renderRemainingValue(milestone) {
        const _contract = milestone._contract;
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
        const tableStructure = [
            {
                header: "Projekt",
                renderTdBody: (milestone) => react_1.default.createElement(react_1.default.Fragment, null, milestone._contract?._project.ourId),
            },
            {
                header: "Oznaczenie",
                renderTdBody: (milestone) => react_1.default.createElement(react_1.default.Fragment, null, "ourId" in milestone ? milestone.ourId : ""),
            },
            { header: "Numer", objectAttributeToShow: "number" },
            { header: "Nazwa", renderTdBody: (milestone) => renderName(milestone) },
            {
                header: "Rozpoczęcie",
                renderTdBody: (milestone) => renderStartDate(milestone),
            },
            { header: "Zakończenie", renderTdBody: (milestone) => renderEndDate(milestone) },
        ];
        const allowedRoles = [MainSetupReact_1.default.SystemRoles.ADMIN.systemName, MainSetupReact_1.default.SystemRoles.ENVI_MANAGER.systemName];
        if (MainSetupReact_1.default.isRoleAllowed(allowedRoles)) {
            tableStructure.push({
                header: "Do rozliczenia",
                renderTdBody: (milestone) => renderRemainingValue(milestone),
            });
        }
        return tableStructure;
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            react_1.default.createElement(react_bootstrap_1.Card.Title, null, "Ko\u0144cz\u0105ce si\u0119 kamienie milowe"),
            react_1.default.createElement(FilterableTable_1.default, { id: "milestones", title: "", initialSections: buildTree(ourMilestones, otherMilestones), tableStructure: makeTablestructure(), isDeletable: false, repository: MainWindowController_1.milestonesRepository, selectedObjectRoute: "/milestone/", externalUpdate: externalUpdate }))));
}
exports.default = MilestonesList;
function DateEditTrigger({ date, milestone, onEdit }) {
    return date ? ToolsDate_1.default.dateYMDtoDMY(date) : "Jeszcze nie ustalono";
}
function buildTree(ourMilestones, otherMilestones) {
    const milestoneGroupNodes = [
        {
            id: "milestoneGroupOur",
            isInAccordion: true,
            level: 1,
            type: "milestoneGroup",
            childrenNodesType: "milestone",
            repository: MainWindowController_1.milestonesRepository,
            dataItem: { id: 1 },
            titleLabel: "Kontrakty ENVI",
            children: [],
            leaves: [...ourMilestones],
            isDeletable: false,
        },
        {
            id: "milestoneGroupOther",
            isInAccordion: true,
            level: 1,
            type: "milestoneGroup",
            childrenNodesType: "milestone",
            repository: MainWindowController_1.milestonesRepository,
            dataItem: { id: 2 },
            titleLabel: "Pozostałe kontrakty",
            children: [],
            leaves: [...otherMilestones],
            isDeletable: false,
        },
    ];
    return milestoneGroupNodes;
}
