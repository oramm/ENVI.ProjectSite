import * as Yup from "yup";

const needFields = {
    _client: Yup.object().required("Wybierz klienta"),
    name: Yup.string()
        .required("Podaj nazwę")
        .min(3, "Nazwa musi mieć co najmniej 3 znaki")
        .max(150, "Nazwa może mieć maksymalnie 150 znaków"),
    description: Yup.string()
        .required("Podaj opis")
        .min(10, "Opis musi mieć co najmniej 10 znaków")
        .max(1000, "Opis może mieć maksymalnie 1000 znaków"),
    status: Yup.string().required("Podaj status"),
};

export function makeNeedValidationSchema() {
    return Yup.object().shape({
        ...needFields,
    });
}
