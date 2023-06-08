"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionButton = exports.InvoiceSetAsSentModalButton = exports.InvoiceIssueModalButton = exports.ChangeStatusButton = exports.InvoiceAddNewModalButton = exports.InvoiceEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const InvoiceModalBody_1 = require("./InvoiceModalBody");
const InvoiceValidationSchema_1 = require("./InvoiceValidationSchema");
const InvoicesSearch_1 = require("../InvoicesSearch");
const InvoiceDetails_1 = require("../InvoiceDetails/InvoiceDetails");
const react_bootstrap_1 = require("react-bootstrap");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const InvoiceIssueModalBody_1 = require("./InvoiceIssueModalBody");
const InvoiceSetAsSentModalBody_1 = require("./InvoiceSetAsSentModalBody");
/** przycisk i modal edycji Invoice */
function InvoiceEditModalButton({ modalProps: { onEdit, initialData, }, buttonProps }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: InvoiceModalBody_1.InvoiceModalBody,
            modalTitle: "Edycja faktury",
            repository: InvoicesSearch_1.invoicesRepository,
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
            repository: InvoicesSearch_1.invoicesRepository,
            makeValidationSchema: InvoiceValidationSchema_1.makeInvoiceValidationSchema
        }, buttonProps: {
            buttonCaption: "Rejestruj fakturę",
            buttonVariant: "outline-success",
        } }));
}
exports.InvoiceAddNewModalButton = InvoiceAddNewModalButton;
function ChangeStatusButton({ specialActionRoute, newStatus }) {
    const { invoice, setInvoice } = (0, InvoiceDetails_1.useInvoice)();
    async function handleChangeStatus() {
        const editedInvoice = await InvoicesSearch_1.invoicesRepository.editItemNodeJS(invoice, specialActionRoute);
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
            repository: InvoicesSearch_1.invoicesRepository,
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
            repository: InvoicesSearch_1.invoicesRepository,
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
        case MainSetupReact_1.default.invoiceStatusNames[0]: //'Na później'
            return (react_1.default.createElement(ChangeStatusButton, { specialActionRoute: 'setAsToMakeInvoice', newStatus: MainSetupReact_1.default.invoiceStatusNames[1] }));
        case MainSetupReact_1.default.invoiceStatusNames[1]: //'Do zrobienia'
            return react_1.default.createElement(InvoiceIssueModalButton, null);
        case MainSetupReact_1.default.invoiceStatusNames[2]: //'Zrobiona'
            return react_1.default.createElement(InvoiceSetAsSentModalButton, null);
        case MainSetupReact_1.default.invoiceStatusNames[3]: //'Wysłana'
            return (react_1.default.createElement(ChangeStatusButton, { specialActionRoute: 'setAsPaidInvoice', newStatus: MainSetupReact_1.default.invoiceStatusNames[4] }));
        case MainSetupReact_1.default.invoiceStatusNames[4]: //'Zapłacona'
        case MainSetupReact_1.default.invoiceStatusNames[5]: //'Do korekty'
        case MainSetupReact_1.default.invoiceStatusNames[6]: //'Wycofana'
        default:
            return react_1.default.createElement(react_1.default.Fragment, null);
    }
}
exports.ActionButton = ActionButton;
