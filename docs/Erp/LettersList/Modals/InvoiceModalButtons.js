"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceAddNewModalButton = exports.InvoiceEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const InvoiceModalBody_1 = require("./InvoiceModalBody");
const InvoiceValidationSchema_1 = require("./InvoiceValidationSchema");
const InvoicesSearch_1 = require("../InvoicesSearch");
/** przycisk i modal edycji Invoice */
function InvoiceEditModalButton({ modalProps: { onEdit, initialData, }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: InvoiceModalBody_1.InvoiceModalBody,
            modalTitle: "Edycja faktury",
            repository: InvoicesSearch_1.invoicesRepository,
            initialData: initialData,
            makeValidationSchema: InvoiceValidationSchema_1.ourLetterValidationSchema
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.InvoiceEditModalButton = InvoiceEditModalButton;
function InvoiceAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: InvoiceModalBody_1.InvoiceModalBody,
            modalTitle: "Rejestruj fakturę",
            repository: InvoicesSearch_1.invoicesRepository,
            makeValidationSchema: InvoiceValidationSchema_1.ourLetterValidationSchema
        }, buttonProps: {
            buttonCaption: "Rejestruj fakturę",
            buttonVariant: "outline-success",
        } }));
}
exports.InvoiceAddNewModalButton = InvoiceAddNewModalButton;
