"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractsRepository = exports.projectsRepository = exports.entitiesRepository = exports.invoiceItemsRepository = exports.invoicesRepository = void 0;
const react_1 = __importDefault(require("react"));
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const InvoicesController_1 = __importDefault(require("./InvoicesController"));
const InvoiceFilterBody_1 = require("./InvoiceFilterBody");
const InvoiceModalButtons_1 = require("./Modals/InvoiceModalButtons");
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
exports.invoicesRepository = InvoicesController_1.default.invoicesRepository;
exports.invoiceItemsRepository = InvoicesController_1.default.invoiceItemsRepository;
exports.entitiesRepository = InvoicesController_1.default.entitiesRepository;
exports.projectsRepository = InvoicesController_1.default.projectsRepository;
exports.contractsRepository = InvoicesController_1.default.contractsRepository;
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
            { header: 'Numer', objectAttributeToShow: 'number' },
            { header: 'Utworzono', objectAttributeToShow: 'issueDate' },
            { header: 'Wysłano', objectAttributeToShow: 'sentDate' },
            { header: 'Odbiorca', renderTdBody: makeEntityLabel },
            { header: 'Netto, zł', objectAttributeToShow: '_totalNetValue' },
            { header: 'Termin płatności', objectAttributeToShow: 'paymentDeadline' },
        ], AddNewButtonComponents: [InvoiceModalButtons_1.InvoiceAddNewModalButton], EditButtonComponent: InvoiceModalButtons_1.InvoiceEditModalButton, isDeletable: true, repository: exports.invoicesRepository, selectedObjectRoute: '/invoice/' }));
}
exports.default = InvoicesSearch;
