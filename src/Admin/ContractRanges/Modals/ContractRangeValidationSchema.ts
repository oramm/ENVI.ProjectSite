import * as Yup from "yup";

const commonFields = {
    name: Yup.string()
        .required("Podaj nazwę")
        .min(3, "Nazwa musi mieć co najmniej 3 znaki")
        .max(100, "Nazwa może mieć maksymalnie 100 znaków"),
    description: Yup.string().max(500, "Opis może mieć maksymalnie 500 znaków"),
};

export function makeContractRangeValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
    });
}
