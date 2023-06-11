"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable"));
const ContractsController_1 = require("./ContractsController");
const ContractsFilterBody_1 = require("./ContractsFilterBody");
const ContractModalButtons_1 = require("./Modals/ContractModalButtons");
function ContractsSearch({ title }) {
    return (react_1.default.createElement(FilterableTable_1.default, { title: title, FilterBodyComponent: ContractsFilterBody_1.ContractsFilterBody, tableStructure: [
            { header: 'Oznaczenie', objectAttributeToShow: 'ourId' },
            { header: 'Numer', objectAttributeToShow: 'number' },
            { header: 'Nazwa', objectAttributeToShow: 'name' },
            { header: 'Rozpoczęcie', objectAttributeToShow: 'startDate' },
            { header: 'Zakończenie', objectAttributeToShow: 'endDate' },
        ], AddNewButtonComponents: [ContractModalButtons_1.OurContractAddNewModalButton, ContractModalButtons_1.OtherContractAddNewModalButton], EditButtonComponent: ContractModalButtons_1.ContractEditModalButton, isDeletable: true, repository: ContractsController_1.contractsRepository, selectedObjectRoute: '/contract/' }));
}
exports.default = ContractsSearch;
