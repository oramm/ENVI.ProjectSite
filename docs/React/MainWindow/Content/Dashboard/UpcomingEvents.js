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
// UpcomingEventsCard.tsx
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const ContractModalBodiesPartial_1 = require("../../../../Contracts/ContractsList/Modals/ContractModalBodiesPartial");
const ContractModalButtons_1 = require("../../../../Contracts/ContractsList/Modals/ContractModalButtons");
const CommonComponents_1 = require("../../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../../View/Resultsets/FilterableTable/FilterableTable"));
const MainSetupReact_1 = __importDefault(require("../../../MainSetupReact"));
const Tools_1 = __importDefault(require("../../../Tools"));
const ToolsDate_1 = __importDefault(require("../../../ToolsDate"));
const MainWindowController_1 = require("../../MainWindowController");
function UpcomingEvents() {
    const [contracts, setContracts] = (0, react_1.useState)([]);
    const [dataLoaded, setDataLoaded] = (0, react_1.useState)(false);
    const [externalUpdate, setExternalUpdate] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            setDataLoaded(false);
            const endDateTo = ToolsDate_1.default.addDays(new Date(), 30);
            const [contracts] = await Promise.all([
                MainWindowController_1.contractsRepository.loadItemsFromServer({
                    status: JSON.stringify([
                        MainSetupReact_1.default.ContractStatuses.IN_PROGRESS,
                        MainSetupReact_1.default.ContractStatuses.NOT_STARTED
                    ]),
                    endDateTo: endDateTo.toISOString().slice(0, 10),
                }),
            ]);
            setContracts(contracts);
            setExternalUpdate(prevState => prevState + 1);
            setDataLoaded(true);
        }
        ;
        fetchData();
    }, []);
    function handleEditObject(object) {
        setContracts(contracts.map((o) => (o.id === object.id ? object : o)));
        setExternalUpdate(prevState => prevState + 1);
    }
    function renderName(contract) {
        return react_1.default.createElement(react_1.default.Fragment, null,
            contract.name,
            react_1.default.createElement(ContractModalButtons_1.ContractPartialEditTrigger, { modalProps: {
                    initialData: contract,
                    modalTitle: 'Edycja statusu',
                    repository: MainWindowController_1.contractsRepository,
                    ModalBodyComponent: ContractModalBodiesPartial_1.ContractModalBodyStatus,
                    onEdit: handleEditObject,
                    fieldsToUpdate: ['status'],
                } },
                react_1.default.createElement(CommonComponents_1.ContractStatusBadge, { status: contract.status })));
    }
    function renderEndDate(endDate) {
        const daysLeft = ToolsDate_1.default.countDaysLeftTo(endDate);
        return react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null, endDate),
            react_1.default.createElement("div", null,
                react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft })));
    }
    function renderValue(value) {
        if (value === undefined)
            return react_1.default.createElement(react_1.default.Fragment, null);
        const formatedValue = Tools_1.default.formatNumber(value);
        return react_1.default.createElement("div", { className: "text-end" }, formatedValue);
    }
    function renderType(isCash) {
        return react_1.default.createElement(react_1.default.Fragment, null, isCash ? 'Gotówka' : 'Gwarancja');
    }
    function renderFirstPartExpiryDate(security) {
        if (!security.firstPartExpiryDate)
            return react_1.default.createElement(react_1.default.Fragment, null, security._contract.startDate);
        const daysLeft = ToolsDate_1.default.countDaysLeftTo(security.firstPartExpiryDate);
        return react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null, security.firstPartExpiryDate),
            daysLeft < 30 ? react_1.default.createElement("div", null,
                react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft })) : '');
    }
    function renderSecondPartExpiryDate(security) {
        if (!security.secondPartExpiryDate)
            return react_1.default.createElement(react_1.default.Fragment, null, security._contract.guaranteeEndDate || 'Sprawdź w umowie');
        const daysLeft = ToolsDate_1.default.countDaysLeftTo(security.secondPartExpiryDate);
        return react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null, security.secondPartExpiryDate),
            daysLeft < 30 ? react_1.default.createElement("div", null,
                react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft })) : '');
    }
    function renderDescription(security) {
        if (!security.description)
            return react_1.default.createElement(react_1.default.Fragment, null);
        return react_1.default.createElement(react_1.default.Fragment, null, security.description);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Card, null,
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Card.Title, null, "Ko\u0144cz\u0105ce si\u0119 Kontrakty"),
                react_1.default.createElement(FilterableTable_1.default, { id: 'contracts', title: '', tableStructure: [
                        { header: 'Projekt', renderTdBody: (contract) => react_1.default.createElement(react_1.default.Fragment, null, contract._parent.ourId) },
                        { header: 'Oznaczenie', objectAttributeToShow: 'ourId' },
                        { header: 'Numer', objectAttributeToShow: 'number' },
                        { header: 'Nazwa', renderTdBody: (contract) => renderName(contract) },
                        { header: 'Rozpoczęcie', objectAttributeToShow: 'startDate' },
                        { header: 'Zakończenie', renderTdBody: (contract) => renderEndDate(contract.endDate) },
                    ], 
                    //EditButtonComponent={ContractEditModalButton}
                    isDeletable: false, repository: MainWindowController_1.contractsRepository, selectedObjectRoute: '/contract/', initialObjects: contracts, externalUpdate: externalUpdate }))),
        react_1.default.createElement(react_bootstrap_1.Card, null,
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Card.Title, null, "ZNWu do zwrotu"),
                react_1.default.createElement(FilterableTable_1.default, { id: 'securities', title: '', tableStructure: [
                        { header: 'Typ', renderTdBody: (security) => renderType(security.isCash) },
                        { header: 'Oznaczenie', renderTdBody: (security) => react_1.default.createElement(react_1.default.Fragment, null, security._contract.ourId) },
                        { header: 'Wartość', renderTdBody: (security) => renderValue(security.value) },
                        { header: 'Zwrócono', renderTdBody: (security) => renderValue(security.returnedValue) },
                        { header: 'Do zwrotu', renderTdBody: (security) => renderValue(security._remainingValue) },
                        { header: '70% Wygasa', renderTdBody: (security) => renderFirstPartExpiryDate(security) },
                        { header: '30% Wygasa', renderTdBody: (security) => renderSecondPartExpiryDate(security) },
                        { header: 'Uwagi', renderTdBody: (security) => renderDescription(security) },
                    ], isDeletable: true, repository: MainWindowController_1.securitiesRepository, selectedObjectRoute: '/contract/' })))));
}
exports.default = UpcomingEvents;
