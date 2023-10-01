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
const CommonComponents_1 = require("../../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../../View/Resultsets/FilterableTable/FilterableTable"));
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
                    statusType: 'active',
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
            contract.name,
            react_1.default.createElement(CommonComponents_1.ContractStatusBadge, { status: contract.status }));
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            react_1.default.createElement(react_bootstrap_1.Card.Title, null, "Ko\u0144cz\u0105ce si\u0119 Kontrakty"),
            react_1.default.createElement(react_bootstrap_1.Card.Text, null,
                react_1.default.createElement(FilterableTable_1.default, { id: 'contracts', title: '', 
                    //FilterBodyComponent={ContractsFilterBody}
                    tableStructure: [
                        { header: 'Projekt', renderTdBody: (contract) => react_1.default.createElement(react_1.default.Fragment, null, contract._parent.ourId) },
                        { header: 'Oznaczenie', objectAttributeToShow: 'ourId' },
                        { header: 'Numer', objectAttributeToShow: 'number' },
                        { header: 'Nazwa', renderTdBody: (contract) => renderName(contract) },
                        { header: 'Rozpoczęcie', objectAttributeToShow: 'startDate' },
                        { header: 'Zakończenie', objectAttributeToShow: 'endDate' },
                        { header: 'Gwarancja do', objectAttributeToShow: 'guaranteeEndDate' },
                    ], 
                    //AddNewButtonComponents={[OurContractAddNewModalButton, OtherContractAddNewModalButton]}
                    //EditButtonComponent={ContractEditModalButton}
                    isDeletable: false, repository: MainWindowController_1.contractsRepository, selectedObjectRoute: '/contract/', externalUpdate: externalUpdate })))));
}
exports.default = UpcomingEvents;
