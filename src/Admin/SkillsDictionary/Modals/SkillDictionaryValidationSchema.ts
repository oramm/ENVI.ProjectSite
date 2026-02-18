import * as Yup from "yup";
import { normalizeOptionalDescription } from "../skillsDictionaryApi";

const commonFields = {
    name: Yup.string()
        .required("Podaj nazwe")
        .min(2, "Nazwa musi miec co najmniej 2 znaki")
        .max(100, "Nazwa moze miec maksymalnie 100 znakow"),
    description: Yup.string()
        .nullable()
        .notRequired()
        .transform((_, originalValue) => normalizeOptionalDescription(originalValue))
        .max(1000, "Opis moze miec maksymalnie 1000 znakow"),
};

export function makeSkillDictionaryValidationSchema(_isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
    });
}
