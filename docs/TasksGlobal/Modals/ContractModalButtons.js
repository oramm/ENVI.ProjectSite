"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtherContractAddNewModalButton = exports.OurContractAddNewModalButton = exports.ContractEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const ContractModalButtons_1 = require("../../Contracts/ContractsList/Modals/ContractModalButtons");
const TasksGlobalController_1 = require("../TasksGlobalController");
function ContractEditModalButton({ modalProps: { onEdit, initialData }, buttonProps, }) {
    return (react_1.default.createElement(ContractModalButtons_1.ContractEditModalButtonGeneric, { modalProps: {
            onEdit,
            initialData,
            repository: TasksGlobalController_1.contractsRepository
        }, buttonProps: buttonProps }));
}
exports.ContractEditModalButton = ContractEditModalButton;
function OurContractAddNewModalButton({ modalProps: { onAddNew }, buttonProps }) {
    return (react_1.default.createElement(ContractModalButtons_1.OurContractAddNewModalButtonGeneric, { modalProps: {
            onAddNew,
            repository: TasksGlobalController_1.contractsRepository
        }, buttonProps: buttonProps }));
}
exports.OurContractAddNewModalButton = OurContractAddNewModalButton;
function OtherContractAddNewModalButton({ modalProps: { onAddNew }, buttonProps }) {
    return (react_1.default.createElement(ContractModalButtons_1.OtherContractAddNewModalButtonGeneric, { modalProps: {
            onAddNew,
            repository: TasksGlobalController_1.contractsRepository
        }, buttonProps: buttonProps }));
}
exports.OtherContractAddNewModalButton = OtherContractAddNewModalButton;
