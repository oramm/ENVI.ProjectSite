import * as Yup from "yup";

const commonFields = {
    name: Yup.string()
        .required("Podaj nazwę")
        .min(3, "Nazwa musi mieć co najmniej 3 znaki")
        .max(150, "Nazwa może mieć maksymalnie 150 znaków"),
    alias: Yup.string()
        .required("Podaj alias")
        .min(3, "Alias musi mieć co najmniej 3 znaki")
        .max(50, "Alias może mieć maksymalnie 50 znaków"),
    description: Yup.string()
        .required("Podaj opis")
        .min(10, "Opis musi mieć co najmniej 10 znaków")
        .max(1000, "Opis może mieć maksymalnie 1000 znaków"),
    _financialAidProgramme: Yup.object().required("Wybierz program"),
};

export function makeFocusAreaValidationSchema() {
    return Yup.object().shape({
        ...commonFields,
    });
}
