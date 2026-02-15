import * as Yup from "yup";

const commonFields = {
    schoolName: Yup.string()
        .required("Podaj nazwę szkoły/uczelni")
        .min(2, "Nazwa musi mieć co najmniej 2 znaki")
        .max(200, "Nazwa może mieć maksymalnie 200 znaków"),
    degreeName: Yup.string().nullable().notRequired().max(100, "Maksymalnie 100 znaków"),
    fieldOfStudy: Yup.string().nullable().notRequired().max(200, "Maksymalnie 200 znaków"),
    dateFrom: Yup.string().nullable().notRequired(),
    dateTo: Yup.string().nullable().notRequired(),
};

export function makeEducationValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
    });
}
