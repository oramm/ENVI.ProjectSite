import * as Yup from "yup";

/**
 * Backend przyjmuje flagi WYŁĄCZNIE jako wartości logiczne - odrzuca "true", 1 i "1".
 * Te pola sterują dostępem do faktur kosztowych i wyciągów bankowych, więc niejawna
 * konwersja typu jest tu niepożądana. Yup wymusza tu boolean po stronie klienta.
 */
const flagFields = {
    systemRoleId: Yup.number()
        .required("Wybierz rolę")
        .transform((value, original) => (original === "" || original === null ? undefined : value)),
    isDriver: Yup.boolean().required(),
    isInScrum: Yup.boolean().required(),
    hasCostInvoiceAccess: Yup.boolean().required(),
    hasBankAccess: Yup.boolean().required(),
    canLogSiteVisits: Yup.boolean().required(),
    isActive: Yup.boolean().required(),
};

export function makeStaffMemberValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...flagFields,
    });
}
