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
    startDate: Yup.string()
        .nullable()
        .matches(/^\d{4}-\d{2}-\d{2}$/, "Nieprawidłowy format daty (wymagany format RRRR-MM-DD)"),
    endDate: Yup.string()
        .nullable()
        .matches(/^\d{4}-\d{2}-\d{2}$/, "Nieprawidłowy format daty (wymagany format RRRR-MM-DD)"),
    status: Yup.string()
        .required("Podaj status")
        .oneOf(["active", "pending", "completed", "cancelled"], "Nieprawidłowy status"),
    focusAreaId: Yup.number().required("Wybierz obszar interwencji").positive("Nieprawidłowy obszar interwencji"),
};

export function makeApplicationCallValidationSchema() {
    return Yup.object().shape({
        ...applicationCallFields,
    });
}
