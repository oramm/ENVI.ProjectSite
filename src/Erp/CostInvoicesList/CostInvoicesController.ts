import { CostInvoice } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

/**
 * Statusy faktur kosztowych
 */
export const CostInvoiceStatuses = {
    NEW: "Nowa",
    VERIFIED: "Zweryfikowana",
    APPROVED: "Zatwierdzona",
    REJECTED: "Odrzucona",
};

/**
 * Kategorie kosztów
 */
export const CostCategories = {
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
export const costInvoicesRepository = new RepositoryReact<CostInvoice>({
    actionRoutes: {
        getRoute: "costInvoices",
        addNewRoute: "costInvoice",
        editRoute: "costInvoice",
        deleteRoute: "costInvoice",
    },
    name: "costInvoices",
});
