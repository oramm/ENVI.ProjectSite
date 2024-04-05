import * as Yup from "yup";

const applicationCallFields = {
    description: Yup.string()
        .required("Podaj opis")
        .min(10, "Opis musi mieć co najmniej 10 znaków")
        .max(1000, "Opis może mieć maksymalnie 1000 znaków"),
    url: Yup.string()
        .required("Podaj URL")
        .url("Nieprawidłowy format URL")
        .max(200, "URL może mieć maksymalnie 200 znaków"),
    startDate: Yup.date().required("Podaj datę początku naboru"),
    endDate: Yup.date().required("Podaj datę zakończenia naboru"),
    status: Yup.string().required("Podaj status"),
    _focusArea: Yup.object().required("Wybierz obszar interwencji"),
};

export function makeApplicationCallValidationSchema() {
    return Yup.object().shape({
        ...applicationCallFields,
    });
}
