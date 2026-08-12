import * as Yup from "yup";

/**
 * Limity długości odpowiadają kolumnom w tabeli Cars - MariaDB obcięłaby dłuższą
 * wartość po cichu, więc lepiej zatrzymać ją tutaj.
 */
const commonFields = {
    brand: Yup.string().required("Podaj markę").max(50, "Marka może mieć maksymalnie 50 znaków"),
    model: Yup.string().required("Podaj model").max(50, "Model może mieć maksymalnie 50 znaków"),
    licensePlateNumber: Yup.string()
        .required("Podaj numer rejestracyjny ")
        .max(15, "Numer rejestracyjny może mieć maksymalnie 15 znaków"),
    mileageSpreadsheetId: Yup.string()
        .nullable()
        .notRequired()
        .max(100, "Identyfikator arkusza może mieć maksymalnie 100 znaków"),
    mileageSheetGid: Yup.number()
        .nullable()
        .notRequired()
        .transform((value, original) => (original === "" || original === null ? null : value))
        .integer("Numer zakładki musi być liczbą całkowitą"),
    comment: Yup.string().nullable().notRequired().max(300, "Uwagi mogą mieć maksymalnie 300 znaków"),
};

export function makeCarValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
    });
}
