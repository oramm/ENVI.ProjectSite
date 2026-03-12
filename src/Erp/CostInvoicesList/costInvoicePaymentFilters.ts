import { PaymentStatuses } from "./CostInvoicesController";

export const paymentStatusFilterOptions = [
    { value: PaymentStatuses.UNPAID, label: "Niezaplacona" },
    { value: PaymentStatuses.PARTIALLY_PAID, label: "Czesciowo zaplacona" },
    { value: PaymentStatuses.PAID, label: "Zaplacona" },
] as const;

export const PaymentMethodFilters = {
    BANK_TRANSFER: "BANK_TRANSFER",
    CASH: "CASH",
    CARD: "CARD",
    MOBILE: "MOBILE",
    VOUCHER: "VOUCHER",
    CHECK: "CHECK",
    CREDIT: "CREDIT",
    OTHER_OR_EMPTY: "OTHER_OR_EMPTY",
} as const;

export type PaymentMethodFilter = typeof PaymentMethodFilters[keyof typeof PaymentMethodFilters];

export const paymentMethodFilterOptions: ReadonlyArray<{
    value: PaymentMethodFilter;
    label: string;
}> = [
    { value: PaymentMethodFilters.BANK_TRANSFER, label: "Przelew" },
    { value: PaymentMethodFilters.CASH, label: "Gotowka" },
    { value: PaymentMethodFilters.CARD, label: "Karta" },
    { value: PaymentMethodFilters.MOBILE, label: "Mobilna" },
    { value: PaymentMethodFilters.VOUCHER, label: "Bon" },
    { value: PaymentMethodFilters.CHECK, label: "Czek" },
    { value: PaymentMethodFilters.CREDIT, label: "Kredyt" },
    { value: PaymentMethodFilters.OTHER_OR_EMPTY, label: "Inna / brak" },
] as const;
