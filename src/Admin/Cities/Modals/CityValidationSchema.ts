import * as Yup from "yup";

const commonFields = {
    name: Yup.string()
        .required("Podaj nazwę")
        .min(3, "Nazwa musi mieć co najmniej 3 znaki")
        .max(150, "Nazwa może mieć maksymalnie 150 znaków"),
    code: Yup.string()
        .nullable()
        .notRequired()
        .test("is-code", "Oznaczenie musi składać się z 3 znaków", (value) => {
            if (!value) return true;
            return value.length === 3;
        }),
};

export function makeCityValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
    });
}
