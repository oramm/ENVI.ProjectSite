import * as Yup from "yup";

const commonFields = {
    organizationName: Yup.string()
        .required("Podaj nazwę organizacji")
        .min(2, "Nazwa musi mieć co najmniej 2 znaki")
        .max(200, "Nazwa może mieć maksymalnie 200 znaków"),
    positionName: Yup.string().nullable().notRequired().max(200, "Maksymalnie 200 znaków"),
    description: Yup.string().nullable().notRequired().max(2000, "Maksymalnie 2000 znaków"),
    dateFrom: Yup.string().nullable().notRequired(),
    dateTo: Yup.string().nullable().notRequired(),
    isCurrent: Yup.boolean().notRequired(),
};

export function makeExperienceValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
    });
}
