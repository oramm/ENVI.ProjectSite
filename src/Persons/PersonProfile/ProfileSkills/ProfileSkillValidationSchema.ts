import * as Yup from "yup";

const commonFields = {
    skillId: Yup.number()
        .required("Wybierz specjalizację")
        .positive("Wybierz specjalizację"),
    levelCode: Yup.string().nullable().notRequired(),
    yearsOfExperience: Yup.number().nullable().notRequired().min(0, "Wartość nie może być ujemna").max(50, "Maksymalnie 50 lat"),
};

export function makeProfileSkillValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
    });
}
