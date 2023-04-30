"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsRepository = exports.entitiesRepository = exports.contractsRepository = void 0;
const react_1 = __importDefault(require("react"));
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable"));
const ContractsController_1 = __importDefault(require("./ContractsController"));
const ContractModalBody_1 = require("./ContractModalBody");
const ContractsFilterBody_1 = require("./ContractsFilterBody");
const OurContractModalBody_1 = require("./OurContractModalBody");
const OtherContractModalBody_1 = require("./OtherContractModalBody");
exports.contractsRepository = ContractsController_1.default.contractsRepository;
exports.entitiesRepository = ContractsController_1.default.entitiesRepository;
exports.projectsRepository = ContractsController_1.default.projectsRepository;
function ContractsSearch({ title }) {
    return (react_1.default.createElement(FilterableTable_1.default, { title: title, FilterBodyComponent: ContractsFilterBody_1.ContractsFilterBody, tableHeaders: ['Oznaczenie', 'Numer', 'Nazwa', 'Data początku', 'Data końca'], RowComponent: ContractSearchTableRow, AddNewButtons: [OurContractModalBody_1.OurContractAddNewModalButton, OtherContractModalBody_1.OtherContractAddNewModalButton], repository: exports.contractsRepository }));
}
exports.default = ContractsSearch;
function ContractSearchTableRow({ dataObject, isActive, onEdit, onDelete, onIsReadyChange }) {
    if (!onIsReadyChange)
        throw new Error('onIsReadyChange is not defined');
    return react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("td", null, dataObject.ourId),
        react_1.default.createElement("td", null, dataObject.number),
        react_1.default.createElement("td", null, dataObject.name),
        react_1.default.createElement("td", null, dataObject.startDate),
        react_1.default.createElement("td", null, dataObject.endDate),
        isActive && (react_1.default.createElement("td", null,
            onEdit && (react_1.default.createElement(ContractModalBody_1.ContractEditModalButton, { modalProps: { onEdit, initialData: dataObject, }, isOurContract: dataObject.ourId.length > 1 })),
            onDelete && (react_1.default.createElement(ContractModalBody_1.ContractDeleteModalButton, { modalProps: { onDelete, initialData: dataObject } })))));
}
