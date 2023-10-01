"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const ContractsController_1 = require("./ContractsController");
const ContractsFilterBody_1 = require("./ContractsFilterBody");
const ContractModalButtons_1 = require("./Modals/ContractModalButtons");
//rendern name witch COntrctStatusBadge
function renderName(contract) {
    return react_1.default.createElement(react_1.default.Fragment, null,
        contract.name,
        react_1.default.createElement(CommonComponents_1.ContractStatusBadge, { status: contract.status }));
}
function ContractsSearch({ title }) {
    return (react_1.default.createElement(FilterableTable_1.default, { id: 'contracts', title: title, FilterBodyComponent: ContractsFilterBody_1.ContractsFilterBody, tableStructure: [
            { header: 'Projekt', renderTdBody: (contract) => react_1.default.createElement(react_1.default.Fragment, null, contract._parent.ourId) },
            { header: 'Oznaczenie', objectAttributeToShow: 'ourId' },
            { header: 'Numer', objectAttributeToShow: 'number' },
            { header: 'Nazwa', renderTdBody: (contract) => renderName(contract) },
            { header: 'Rozpoczęcie', objectAttributeToShow: 'startDate' },
            { header: 'Zakończenie', objectAttributeToShow: 'endDate' },
            { header: 'Gwarancja do', objectAttributeToShow: 'guaranteeEndDate' },
        ], AddNewButtonComponents: [ContractModalButtons_1.OurContractAddNewModalButton, ContractModalButtons_1.OtherContractAddNewModalButton], EditButtonComponent: ContractModalButtons_1.ContractEditModalButton, isDeletable: true, repository: ContractsController_1.contractsRepository, selectedObjectRoute: '/contract/' }));
}
exports.default = ContractsSearch;
