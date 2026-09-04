import * as Yup from "yup";
import { accountFields } from "../../../Persons/accountFieldsValidation";
import { personFields } from "../../../Persons/Modals/PersonValidationSchema";

/**
 * Reguły modalu dodawania użytkownika: pola osoby + pola konta.
 *
 * Obie połowy są importowane, nie przepisane: pola osoby sprawdza tak samo okno „Osoby",
 * a pola konta - ta sama trasa `PUT /v2/persons/:id/account`, którą zapisuje modal
 * uprawnień. Komunikat przy tym samym polu ma brzmieć wszędzie identycznie.
 */
export function makeUserValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...personFields,
        // Rola jest wymagana już przy zakładaniu: konto bez roli logowałoby się
        // jako EXTERNAL_USER (wartość domyślna bazy), czego nikt nie wybrał.
        // Transform, bo pusty wybór w selektorze dojeżdża jako "" - bez niego yup
        // rzuciłby błędem typu zamiast czytelnym „Wybierz rolę systemową".
        systemRoleId: Yup.number()
            .required("Wybierz rolę systemową")
            .transform((value, original) => (original === "" || original === null ? undefined : value)),
        ...accountFields,
    });
}
