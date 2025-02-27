"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionButton = exports.InvoiceSetAsSentModalButton = exports.InvoiceIssueModalButton = exports.ChangeStatusButton = exports.CopyButton = exports.InvoiceAddNewModalButton = exports.InvoiceEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const InvoiceModalBody_1 = require("./InvoiceModalBody");
const InvoiceValidationSchema_1 = require("./InvoiceValidationSchema");
const InvoiceDetails_1 = require("../InvoiceDetails/InvoiceDetails");
const react_bootstrap_1 = require("react-bootstrap");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const InvoiceIssueModalBody_1 = require("./InvoiceIssueModalBody");
const InvoiceSetAsSentModalBody_1 = require("./InvoiceSetAsSentModalBody");
const InvoicesController_1 = require("../InvoicesController");
/** przycisk i modal edycji Invoice */
function InvoiceEditModalButton({ modalProps: { onEdit, initialData, }, buttonProps }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: InvoiceModalBody_1.InvoiceModalBody,
            modalTitle: "Edycja faktury",
            repository: InvoicesController_1.invoicesRepository,
            initialData: initialData,
            makeValidationSchema: InvoiceValidationSchema_1.makeInvoiceValidationSchema
        }, buttonProps: {
            ...buttonProps,
            buttonVariant: "outline-success",
        } }));
}
exports.InvoiceEditModalButton = InvoiceEditModalButton;
function InvoiceAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: InvoiceModalBody_1.InvoiceModalBody,
            modalTitle: "Rejestruj fakturę",
            repository: InvoicesController_1.invoicesRepository,
            makeValidationSchema: InvoiceValidationSchema_1.makeInvoiceValidationSchema
        }, buttonProps: {
            buttonCaption: "Rejestruj fakturę",
            buttonVariant: "outline-success",
        } }));
}
exports.InvoiceAddNewModalButton = InvoiceAddNewModalButton;
function CopyButton({ onError }) {
    const { invoice } = (0, InvoiceDetails_1.useInvoice)();
    async function handleClick() {
        try {
            await InvoicesController_1.invoicesRepository.copyItem(invoice);
        }
        catch (error) {
            if (error instanceof Error) {
                onError(error);
            }
        }
    }
    return (react_1.default.createElement(react_bootstrap_1.Button, { key: "Kopiuj", variant: "outline-secondary", size: "sm", onClick: handleClick }, "Kopiuj"));
}
exports.CopyButton = CopyButton;
function ChangeStatusButton({ specialActionRoute, newStatus }) {
    const { invoice, setInvoice } = (0, InvoiceDetails_1.useInvoice)();
    async function handleChangeStatus() {
        const editedInvoice = await InvoicesController_1.invoicesRepository.editItem(invoice, specialActionRoute);
        setInvoice(editedInvoice);
    }
    return (react_1.default.createElement(react_bootstrap_1.Button, { key: `Ustaw jako ${newStatus}`, variant: 'primary', size: 'sm', onClick: handleChangeStatus }, `Ustaw jako ${newStatus}`));
}
exports.ChangeStatusButton = ChangeStatusButton;
function InvoiceIssueModalButton() {
    const { invoice, setInvoice } = (0, InvoiceDetails_1.useInvoice)();
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: setInvoice,
            specialActionRoute: 'issueInvoice',
            ModalBodyComponent: InvoiceIssueModalBody_1.InvoiceIssueModalBody,
            modalTitle: "Wystaw fakturę",
            repository: InvoicesController_1.invoicesRepository,
            initialData: invoice,
            makeValidationSchema: InvoiceValidationSchema_1.makeInvoiceIssueValidationSchema
        }, buttonProps: {
            buttonCaption: "Wystaw fakturę",
            buttonVariant: "primary"
        } }));
}
exports.InvoiceIssueModalButton = InvoiceIssueModalButton;
function InvoiceSetAsSentModalButton() {
    const { invoice, setInvoice } = (0, InvoiceDetails_1.useInvoice)();
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: setInvoice,
            specialActionRoute: 'setAsSentInvoice',
            ModalBodyComponent: InvoiceSetAsSentModalBody_1.InvoiceSetAsSentModalBody,
            modalTitle: "Ustaw jako Wysłana",
            repository: InvoicesController_1.invoicesRepository,
            initialData: invoice,
            makeValidationSchema: InvoiceValidationSchema_1.makeInvoiceSetAsSentValidationSchema
        }, buttonProps: {
            buttonCaption: "Ustaw jako 'Wysłana'",
            buttonVariant: "primary"
        } }));
}
exports.InvoiceSetAsSentModalButton = InvoiceSetAsSentModalButton;
function ActionButton() {
    const { invoice, setInvoice } = (0, InvoiceDetails_1.useInvoice)();
    switch (invoice.status) {
        case MainSetupReact_1.default.InvoiceStatuses.FOR_LATER:
            return (react_1.default.createElement(ChangeStatusButton, { specialActionRoute: 'setAsToMakeInvoice', newStatus: MainSetupReact_1.default.InvoiceStatuses.TO_DO }));
        case MainSetupReact_1.default.InvoiceStatuses.TO_DO:
            return react_1.default.createElement(InvoiceIssueModalButton, null);
        case MainSetupReact_1.default.InvoiceStatuses.DONE:
            return react_1.default.createElement(InvoiceSetAsSentModalButton, null);
        case MainSetupReact_1.default.InvoiceStatuses.SENT:
            return (react_1.default.createElement(ChangeStatusButton, { specialActionRoute: 'setAsPaidInvoice', newStatus: MainSetupReact_1.default.InvoiceStatuses.PAID }));
        case MainSetupReact_1.default.InvoiceStatuses.PAID:
        case MainSetupReact_1.default.InvoiceStatuses.TO_CORRECT:
        case MainSetupReact_1.default.InvoiceStatuses.WITHDRAWN:
        default:
            return react_1.default.createElement(react_1.default.Fragment, null);
    }
}
exports.ActionButton = ActionButton;
