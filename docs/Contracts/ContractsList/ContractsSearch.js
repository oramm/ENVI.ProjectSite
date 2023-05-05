"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsRepository = exports.entitiesRepository = exports.contractsRepository = void 0;
const react_1 = __importDefault(require("react"));
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable"));
const ContractsController_1 = __importDefault(require("./ContractsController"));
const ContractsFilterBody_1 = require("./ContractsFilterBody");
const ContractModalButtons_1 = require("./Modals/ContractModalButtons");
exports.contractsRepository = ContractsController_1.default.contractsRepository;
exports.entitiesRepository = ContractsController_1.default.entitiesRepository;
exports.projectsRepository = ContractsController_1.default.projectsRepository;
function ContractsSearch({ title }) {
    return (react_1.default.createElement(FilterableTable_1.default, { title: title, FilterBodyComponent: ContractsFilterBody_1.ContractsFilterBody, tableStructure: [
            { header: 'Oznaczenie', objectAttributeToShow: 'ourId' },
            { header: 'Numer', objectAttributeToShow: 'number' },
            { header: 'Nazwa', objectAttributeToShow: 'name' },
            { header: 'Rozpoczęcie', objectAttributeToShow: 'startDate' },
            { header: 'Zakończenie', objectAttributeToShow: 'endDate' },
        ], AddNewButtonComponents: [ContractModalButtons_1.OurContractAddNewModalButton, ContractModalButtons_1.OtherContractAddNewModalButton], EditButtonComponent: ContractModalButtons_1.ContractEditModalButton, DeleteButtonComponent: ContractModalButtons_1.ContractDeleteModalButton, repository: exports.contractsRepository, selectedObjectRoute: '/contract/' }));
}
exports.default = ContractsSearch;
