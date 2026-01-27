"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostInvoiceEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const CostInvoiceModalBody_1 = require("./CostInvoiceModalBody");
const CostInvoiceValidationSchema_1 = require("./CostInvoiceValidationSchema");
/**
 * Przycisk i modal edycji faktury kosztowej
 */
function CostInvoiceEditModalButton({ modalProps: { onEdit, initialData, shouldRetrieveDataBeforeEdit, repository }, buttonProps, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: CostInvoiceModalBody_1.CostInvoiceModalBody,
            modalTitle: "Edycja faktury kosztowej",
            repository: repository,
            initialData: initialData,
            makeValidationSchema: CostInvoiceValidationSchema_1.makeCostInvoiceValidationSchema,
            shouldRetrieveDataBeforeEdit,
        }, buttonProps: {
            ...buttonProps,
            buttonVariant: "outline-success",
        } }));
}
exports.CostInvoiceEditModalButton = CostInvoiceEditModalButton;
