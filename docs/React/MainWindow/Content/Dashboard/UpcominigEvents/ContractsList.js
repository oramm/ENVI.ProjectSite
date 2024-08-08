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
const ContractModalBodiesPartial_1 = require("../../../../../Contracts/ContractsList/Modals/ContractModalBodiesPartial");
const ContractValidationSchema_1 = require("../../../../../Contracts/ContractsList/Modals/ContractValidationSchema");
const GeneralModalButtons_1 = require("../../../../../View/Modals/GeneralModalButtons");
const CommonComponents_1 = require("../../../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../../../View/Resultsets/FilterableTable/FilterableTable"));
const MainSetupReact_1 = __importDefault(require("../../../../MainSetupReact"));
const Tools_1 = __importDefault(require("../../../../Tools"));
const ToolsDate_1 = __importDefault(require("../../../../ToolsDate"));
const MainWindowController_1 = require("../../../MainWindowController");
function ContractsList() {
    const [contracts, setContracts] = (0, react_1.useState)([]);
    const [ourContracts, setOurContracts] = (0, react_1.useState)([]);
    const [otherContracts, setOtherContracts] = (0, react_1.useState)([]);
    const [externalUpdate, setExternalUpdate] = (0, react_1.useState)(0);
    const [dataLoaded, setDataLoaded] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            setDataLoaded(false);
            const endDateTo = ToolsDate_1.default.addDays(new Date(), 30);
            const contracts = (await MainWindowController_1.contractsRepository.loadItemsFromServerPOST([
                {
                    status: [MainSetupReact_1.default.ContractStatuses.IN_PROGRESS, MainSetupReact_1.default.ContractStatuses.NOT_STARTED],
                    endDateTo: endDateTo.toISOString().slice(0, 10),
                    getRemainingValue: true,
                    _admin: filterByCurrentUser() ? MainSetupReact_1.default.getCurrentUserAsPerson() : undefined,
                },
            ]));
            setContracts(contracts);
            console.log("contacts", contracts);
            const ourContracts = contracts.filter((c) => {
                console.log("c", c);
                return c._type.isOur;
            });
            setOurContracts(contracts.filter((c) => {
                console.log("c", c);
                if (!c._type)
                    console.error("Error in ContractsList.tsx", c);
                return c._type.isOur;
            }));
            setOtherContracts(contracts.filter((c) => !c._type.isOur));
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
    function renderName(contract) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                    initialData: contract,
                    modalTitle: "Edycja nazwy",
                    repository: MainWindowController_1.contractsRepository,
                    ModalBodyComponent: ContractModalBodiesPartial_1.ContractModalBodyName,
                    onEdit: handleEditObject,
                    fieldsToUpdate: ["name"],
                    makeValidationSchema: ContractValidationSchema_1.contractNameValidationSchema,
                } },
                react_1.default.createElement(react_1.default.Fragment, null, contract.name)),
            " ",
            react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                    initialData: contract,
                    modalTitle: "Edycja statusu",
                    repository: MainWindowController_1.contractsRepository,
                    ModalBodyComponent: ContractModalBodiesPartial_1.ContractModalBodyStatus,
                    onEdit: handleEditObject,
                    fieldsToUpdate: ["status"],
                    makeValidationSchema: ContractValidationSchema_1.contractStatusValidationSchema,
                } },
                react_1.default.createElement(CommonComponents_1.ContractStatusBadge, { status: contract.status }))));
    }
    function renderEndDate(contract) {
        const { endDate } = contract;
        if (!endDate)
            return react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" }, "Brak daty zako\u0144czenia");
        const daysLeft = ToolsDate_1.default.countDaysLeftTo(endDate);
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null,
                react_1.default.createElement(DateEditTrigger, { contract: contract, date: endDate, onEdit: handleEditObject })),
            react_1.default.createElement("div", null,
                react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft }))));
    }
    function renderStartDate(contract) {
        const { startDate } = contract;
        if (!startDate)
            return react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" }, "Brak daty rozpocz\u0119cia");
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(DateEditTrigger, { contract: contract, date: startDate, onEdit: handleEditObject })));
    }
    function handleEditObject(object) {
        setContracts(contracts.map((o) => (o.id === object.id ? object : o)));
        setExternalUpdate((prevState) => prevState + 1);
    }
    function renderRemainingValue(contract) {
        const ourId = "ourId" in contract ? contract.ourId : "";
        if (!ourId || !contract._remainingNotIssuedValue || !contract._remainingNotScheduledValue)
            return react_1.default.createElement(react_1.default.Fragment, null);
        const formatedNotScheduledValue = Tools_1.default.formatNumber(contract._remainingNotScheduledValue || 0, 0);
        const formatedNotIssuedValue = Tools_1.default.formatNumber(contract._remainingNotIssuedValue || 0, 0);
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
                renderTdBody: (contract) => react_1.default.createElement(react_1.default.Fragment, null, contract._project.ourId),
            },
            {
                header: "Oznaczenie",
                renderTdBody: (contract) => (react_1.default.createElement(react_1.default.Fragment, null, "ourId" in contract ? contract.ourId : "")),
            },
            { header: "Numer", objectAttributeToShow: "number" },
            { header: "Nazwa", renderTdBody: (contract) => renderName(contract) },
            {
                header: "Rozpoczęcie",
                renderTdBody: (contract) => renderStartDate(contract),
            },
            { header: "Zakończenie", renderTdBody: (contract) => renderEndDate(contract) },
        ];
        const allowedRoles = [MainSetupReact_1.default.SystemRoles.ADMIN.systemName, MainSetupReact_1.default.SystemRoles.ENVI_MANAGER.systemName];
        if (MainSetupReact_1.default.isRoleAllowed(allowedRoles)) {
            tableStructure.push({
                header: "Do rozliczenia",
                renderTdBody: (contract) => renderRemainingValue(contract),
            });
        }
        return tableStructure;
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            react_1.default.createElement(react_bootstrap_1.Card.Title, null, "Ko\u0144cz\u0105ce si\u0119 Kontrakty"),
            react_1.default.createElement(FilterableTable_1.default, { id: "contracts", title: "", initialSections: buildTree(ourContracts, otherContracts), tableStructure: makeTablestructure(), isDeletable: false, repository: MainWindowController_1.contractsRepository, selectedObjectRoute: "/contract/", externalUpdate: externalUpdate }))));
}
exports.default = ContractsList;
function DateEditTrigger({ date, contract, onEdit }) {
    return (react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
            initialData: contract,
            modalTitle: "Edycja dat",
            repository: MainWindowController_1.contractsRepository,
            ModalBodyComponent: ContractModalBodiesPartial_1.ContractModalBodyDates,
            onEdit: onEdit,
            fieldsToUpdate: ["startDate", "endDate", "guaranteeEndDate"],
            makeValidationSchema: ContractValidationSchema_1.contractDatesValidationSchema,
        } }, react_1.default.createElement(react_1.default.Fragment, null, date ? ToolsDate_1.default.dateYMDtoDMY(date) : "Jeszcze nie ustalono")));
}
function buildTree(ourContracts, otherContracts) {
    const contractGroupNodes = [
        {
            id: "contractGroupOur",
            isInAccordion: true,
            level: 1,
            type: "contractGroup",
            childrenNodesType: "contract",
            repository: MainWindowController_1.contractsRepository,
            dataItem: { id: 1 },
            titleLabel: "Kontrakty ENVI",
            children: [],
            leaves: [...ourContracts],
            isDeletable: false,
        },
        {
            id: "contractGroupOther",
            isInAccordion: true,
            level: 1,
            type: "contractGroup",
            childrenNodesType: "contract",
            repository: MainWindowController_1.contractsRepository,
            dataItem: { id: 2 },
            titleLabel: "Pozostałe kontrakty",
            children: [],
            leaves: [...otherContracts],
            isDeletable: false,
        },
    ];
    return contractGroupNodes;
}
