"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceItemAddNewModalButton = exports.InvoiceItemEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const InvoiceItemModalBody_1 = require("./InvoiceItemModalBody");
const InvoiceItemValidationSchema_1 = require("./InvoiceItemValidationSchema");
const InvoicesController_1 = require("../InvoicesController");
/** przycisk i modal edycji Invoice */
function InvoiceItemEditModalButton({ modalProps: { onEdit, initialData, }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: InvoiceItemModalBody_1.InvoiceItemModalBody,
            modalTitle: "Edycja pozycji faktury",
            repository: InvoicesController_1.invoiceItemsRepository,
            initialData: initialData,
            makeValidationSchema: InvoiceItemValidationSchema_1.InvoiceItemValidationSchema
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.InvoiceItemEditModalButton = InvoiceItemEditModalButton;
function InvoiceItemAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: InvoiceItemModalBody_1.InvoiceItemModalBody,
            modalTitle: "Dodaj pozycję faktury",
            repository: InvoicesController_1.invoiceItemsRepository,
            makeValidationSchema: InvoiceItemValidationSchema_1.InvoiceItemValidationSchema
        }, buttonProps: {
            buttonCaption: "Dodaj pozycję",
            buttonVariant: "outline-success",
        } }));
}
exports.InvoiceItemAddNewModalButton = InvoiceItemAddNewModalButton;
