"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const InvoiceFilterBody_1 = require("./InvoiceFilterBody");
const InvoiceModalButtons_1 = require("./Modals/InvoiceModalButtons");
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const InvoicesController_1 = require("./InvoicesController");
function InvoicesSearch({ title }) {
    function makeEntityLabel(invoice) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            invoice._entity.name,
            " ",
            ' ',
            " ",
            react_1.default.createElement(CommonComponents_1.InvoiceStatusBadge, { status: invoice.status })));
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: 'invoices', title: title, FilterBodyComponent: InvoiceFilterBody_1.InvoicesFilterBody, tableStructure: [
            { header: 'Umowa', renderTdBody: (invoice) => react_1.default.createElement(react_1.default.Fragment, null, invoice._contract.ourId) },
            { header: 'Numer', objectAttributeToShow: 'number' },
            { header: 'Utworzono', objectAttributeToShow: 'issueDate' },
            { header: 'Wysłano', objectAttributeToShow: 'sentDate' },
            { header: 'Odbiorca', renderTdBody: makeEntityLabel },
            { header: 'Netto, zł', objectAttributeToShow: '_totalNetValue' },
            { header: 'Termin płatności', objectAttributeToShow: 'paymentDeadline' },
        ], AddNewButtonComponents: [InvoiceModalButtons_1.InvoiceAddNewModalButton], EditButtonComponent: InvoiceModalButtons_1.InvoiceEditModalButton, isDeletable: true, repository: InvoicesController_1.invoicesRepository, selectedObjectRoute: '/invoice/' }));
}
exports.default = InvoicesSearch;
