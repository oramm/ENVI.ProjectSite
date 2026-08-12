import * as Yup from "yup";

const commonFields = {
    name: Yup.string().required("Podaj nazwę typu").max(60, "Nazwa może mieć maksymalnie 60 znaków"),
    // Kolumna Color to wolny VARCHAR - format wymuszamy tutaj, żeby do bazy
    // nie trafiały wartości, których interfejs nie umie wyświetlić.
    color: Yup.string()
        .required("Podaj kolor")
        .matches(/^#[0-9a-fA-F]{6}$/, "Kolor musi mieć postać #rrggbb, np. #0d6efd"),
};

export function makeAbsenceTypeValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
    });
}
