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
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const ContractsController_1 = require("./ContractsController");
const ContractsFilterBody_1 = require("./ContractsFilterBody");
const ContractModalButtons_1 = require("./Modals/ContractModalButtons");
/**render name witch ContractStatusBadge */
function renderName(contract) {
    return react_1.default.createElement(react_1.default.Fragment, null,
        contract.name,
        " ",
        ' ',
        react_1.default.createElement(CommonComponents_1.ContractStatusBadge, { status: contract.status }));
}
function ContractsSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    return (react_1.default.createElement(FilterableTable_1.default, { id: 'contracts', title: title, FilterBodyComponent: ContractsFilterBody_1.ContractsFilterBody, tableStructure: [
            { header: 'Projekt', renderTdBody: (contract) => react_1.default.createElement(react_1.default.Fragment, null, contract._parent.ourId) },
            { header: 'Oznaczenie', objectAttributeToShow: 'ourId' },
            { header: 'Numer', objectAttributeToShow: 'number' },
            { header: 'Nazwa', renderTdBody: (contract) => renderName(contract) },
            { header: 'Rozpoczęcie', objectAttributeToShow: 'startDate' },
            { header: 'Zakończenie', objectAttributeToShow: 'endDate' },
            { header: 'Gwarancja do', objectAttributeToShow: 'guaranteeEndDate' },
        ], AddNewButtonComponents: [ContractModalButtons_1.OurContractAddNewModalButton, ContractModalButtons_1.OtherContractAddNewModalButton], EditButtonComponent: ContractModalButtons_1.ContractEditModalButton, isDeletable: true, repository: ContractsController_1.contractsRepository, selectedObjectRoute: '/contract/', shouldRetrieveDataBeforeEdit: true }));
}
exports.default = ContractsSearch;
