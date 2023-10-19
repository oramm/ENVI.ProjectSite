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
const ContractModalButtons_1 = require("../../../../../Contracts/ContractsList/Modals/ContractModalButtons");
const ContractValidationSchema_1 = require("../../../../../Contracts/ContractsList/Modals/ContractValidationSchema");
const CommonComponents_1 = require("../../../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../../../View/Resultsets/FilterableTable/FilterableTable"));
const MainSetupReact_1 = __importDefault(require("../../../../MainSetupReact"));
const ToolsDate_1 = __importDefault(require("../../../../ToolsDate"));
const MainWindowController_1 = require("../../../MainWindowController");
function ContractsList() {
    const [contracts, setContracts] = (0, react_1.useState)([]);
    const [externalUpdate, setExternalUpdate] = (0, react_1.useState)(0);
    const [dataLoaded, setDataLoaded] = (0, react_1.useState)(false);
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
    function renderName(contract) {
        return react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ContractModalButtons_1.ContractPartialEditTrigger, { modalProps: {
                    initialData: contract,
                    modalTitle: 'Edycja nazwy',
                    repository: MainWindowController_1.contractsRepository,
                    ModalBodyComponent: ContractModalBodiesPartial_1.ContractModalBodyName,
                    onEdit: handleEditObject,
                    fieldsToUpdate: ['name'],
                    makeValidationSchema: ContractValidationSchema_1.contractNameValidationSchema,
                } },
                react_1.default.createElement(react_1.default.Fragment, null, contract.name)),
            ' ',
            react_1.default.createElement(ContractModalButtons_1.ContractPartialEditTrigger, { modalProps: {
                    initialData: contract,
                    modalTitle: 'Edycja statusu',
                    repository: MainWindowController_1.contractsRepository,
                    ModalBodyComponent: ContractModalBodiesPartial_1.ContractModalBodyStatus,
                    onEdit: handleEditObject,
                    fieldsToUpdate: ['status'],
                    makeValidationSchema: ContractValidationSchema_1.contractStatusValidationSchema
                } },
                react_1.default.createElement(CommonComponents_1.ContractStatusBadge, { status: contract.status })));
    }
    function renderEndDate(contract) {
        const { endDate } = contract;
        const daysLeft = ToolsDate_1.default.countDaysLeftTo(endDate);
        return react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null,
                react_1.default.createElement(DateEditTrigger, { contract: contract, date: endDate, onEdit: handleEditObject })),
            react_1.default.createElement("div", null,
                react_1.default.createElement(CommonComponents_1.DaysLeftBadge, { daysLeft: daysLeft })));
    }
    function renderStartDate(contract) {
        const { startDate } = contract;
        return react_1.default.createElement("div", null,
            react_1.default.createElement(DateEditTrigger, { contract: contract, date: startDate, onEdit: handleEditObject }));
    }
    function handleEditObject(object) {
        setContracts(contracts.map((o) => (o.id === object.id ? object : o)));
        setExternalUpdate(prevState => prevState + 1);
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            react_1.default.createElement(react_bootstrap_1.Card.Title, null, "Ko\u0144cz\u0105ce si\u0119 Kontrakty"),
            react_1.default.createElement(FilterableTable_1.default, { id: 'contracts', title: '', tableStructure: [
                    { header: 'Projekt', renderTdBody: (contract) => react_1.default.createElement(react_1.default.Fragment, null, contract._parent.ourId) },
                    { header: 'Oznaczenie', objectAttributeToShow: 'ourId' },
                    { header: 'Numer', objectAttributeToShow: 'number' },
                    { header: 'Nazwa', renderTdBody: (contract) => renderName(contract) },
                    { header: 'Rozpoczęcie', renderTdBody: (contract) => renderStartDate(contract) },
                    { header: 'Zakończenie', renderTdBody: (contract) => renderEndDate(contract) },
                ], 
                //EditButtonComponent={ContractEditModalButton}
                isDeletable: false, repository: MainWindowController_1.contractsRepository, selectedObjectRoute: '/contract/', initialObjects: contracts, externalUpdate: externalUpdate }))));
}
exports.default = ContractsList;
function DateEditTrigger({ date, contract, onEdit }) {
    return (react_1.default.createElement(ContractModalButtons_1.ContractPartialEditTrigger, { modalProps: {
            initialData: contract,
            modalTitle: 'Edycja dat',
            repository: MainWindowController_1.contractsRepository,
            ModalBodyComponent: ContractModalBodiesPartial_1.ContractModalBodyDates,
            onEdit: onEdit,
            fieldsToUpdate: ['startDate', 'endDate', 'guaranteeEndDate'],
            makeValidationSchema: ContractValidationSchema_1.contractDatesValidationSchema,
        } }, react_1.default.createElement(react_1.default.Fragment, null, date
        ? ToolsDate_1.default.dateYMDtoDMY(date)
        : 'Jeszcze nie ustalono')));
}
