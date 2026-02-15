import * as Yup from "yup";

const commonFields = {
    name: Yup.string()
        .required("Podaj nazwę")
        .min(2, "Nazwa musi mieć co najmniej 2 znaki")
        .max(100, "Nazwa może mieć maksymalnie 100 znaków"),
};

export function makeSkillDictionaryValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
    });
}
