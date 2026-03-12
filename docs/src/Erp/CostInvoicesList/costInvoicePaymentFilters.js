"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentMethodFilterOptions = exports.PaymentMethodFilters = exports.paymentStatusFilterOptions = void 0;
const CostInvoicesController_1 = require("./CostInvoicesController");
exports.paymentStatusFilterOptions = [
    { value: CostInvoicesController_1.PaymentStatuses.UNPAID, label: "Niezaplacona" },
    { value: CostInvoicesController_1.PaymentStatuses.PARTIALLY_PAID, label: "Czesciowo zaplacona" },
    { value: CostInvoicesController_1.PaymentStatuses.PAID, label: "Zaplacona" },
    { value: CostInvoicesController_1.PaymentStatuses.NOT_APPLICABLE, label: "Nie dotyczy" },
];
exports.PaymentMethodFilters = {
    BANK_TRANSFER: "BANK_TRANSFER",
    CASH: "CASH",
    CARD: "CARD",
    MOBILE: "MOBILE",
    VOUCHER: "VOUCHER",
    CHECK: "CHECK",
    CREDIT: "CREDIT",
    OTHER_OR_EMPTY: "OTHER_OR_EMPTY",
};
exports.paymentMethodFilterOptions = [
    { value: exports.PaymentMethodFilters.BANK_TRANSFER, label: "Przelew" },
    { value: exports.PaymentMethodFilters.CASH, label: "Gotowka" },
    { value: exports.PaymentMethodFilters.CARD, label: "Karta" },
    { value: exports.PaymentMethodFilters.MOBILE, label: "Mobilna" },
    { value: exports.PaymentMethodFilters.VOUCHER, label: "Bon" },
    { value: exports.PaymentMethodFilters.CHECK, label: "Czek" },
    { value: exports.PaymentMethodFilters.CREDIT, label: "Kredyt" },
    { value: exports.PaymentMethodFilters.OTHER_OR_EMPTY, label: "Inna / brak" },
];
