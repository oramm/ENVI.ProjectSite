import * as Yup from "yup";
import { CostInvoiceStatuses } from "../CostInvoicesController";

/**
 * Schema walidacji dla edycji faktury kosztowej
 * Większość pól jest tylko do odczytu (pobrane z KSeF)
 * Edytowalne są tylko pola zarządzania wewnętrznego
 */
export function makeCostInvoiceValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        status: Yup.string()
            .required("Status jest wymagany")
            .oneOf(Object.values(CostInvoiceStatuses), "Nieprawidłowy status"),
        isCompanyCost: Yup.boolean().required(),
        isPaid: Yup.boolean().required(),
        paidDate: Yup.date().nullable(),
        paymentDeadline: Yup.date().nullable(),
        costCategory: Yup.string().nullable(),
        comment: Yup.string()
            .max(1000, "Komentarz może mieć maksymalnie 1000 znaków")
            .nullable(),
        _contract: Yup.object().nullable(),
    });
}
