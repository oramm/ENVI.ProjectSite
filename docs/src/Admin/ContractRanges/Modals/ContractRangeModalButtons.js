"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractRangeAddNewModalButton = exports.ContractRangeEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const ContractRangesController_1 = require("../ContractRangesController");
const ContractRangeModalBody_1 = require("./ContractRangeModalBody");
const ContractRangeValidationSchema_1 = require("./ContractRangeValidationSchema");
function ContractRangeEditModalButton({ modalProps: { onEdit, initialData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: ContractRangeModalBody_1.ContractRangeModalBody,
            modalTitle: "Edycja zakresu kontraktu",
            repository: ContractRangesController_1.contractRangesRepository,
            initialData: initialData,
            makeValidationSchema: ContractRangeValidationSchema_1.makeContractRangeValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.ContractRangeEditModalButton = ContractRangeEditModalButton;
function ContractRangeAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ContractRangeModalBody_1.ContractRangeModalBody,
            modalTitle: "Dodaj zakres kontraktu",
            repository: ContractRangesController_1.contractRangesRepository,
            makeValidationSchema: ContractRangeValidationSchema_1.makeContractRangeValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj zakres kontraktu",
            buttonVariant: "outline-success",
        } }));
}
exports.ContractRangeAddNewModalButton = ContractRangeAddNewModalButton;
