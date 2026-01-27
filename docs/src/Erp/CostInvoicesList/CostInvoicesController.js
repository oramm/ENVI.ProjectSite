"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.costInvoicesRepository = exports.CostCategories = exports.CostInvoiceStatuses = void 0;
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
/**
 * Statusy faktur kosztowych
 */
exports.CostInvoiceStatuses = {
    NEW: "Nowa",
    VERIFIED: "Zweryfikowana",
    APPROVED: "Zatwierdzona",
    REJECTED: "Odrzucona",
};
/**
 * Kategorie kosztów
 */
exports.CostCategories = {
    MATERIALS: "Materiały",
    SERVICES: "Usługi",
    EQUIPMENT: "Sprzęt",
    TRAVEL: "Podróże",
    OFFICE: "Biuro",
    OTHER: "Inne",
};
/**
 * Repozytorium faktur kosztowych
 * Dane pobierane z KSeF i przechowywane lokalnie
 */
exports.costInvoicesRepository = new RepositoryReact_1.default({
    actionRoutes: {
        getRoute: "costInvoices",
        addNewRoute: "costInvoice",
        editRoute: "costInvoice",
        deleteRoute: "costInvoice",
    },
    name: "costInvoices",
});
