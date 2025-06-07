import * as Yup from "yup";

const commonFields = {
    name: Yup.string()
        .required("Podaj nazwę")
        .min(3, "Nazwa musi mieć co najmniej 3 znaki")
        .max(150, "Nazwa może mieć maksymalnie 100 znaków"),
    description: Yup.string().max(500, "Opis może mieć maksymalnie 500 znaków"),
    _person: Yup.object().required("Wybierz osobę"),
    groupName: Yup.string().required("Podaj nazwę grupy"),
};

export function makeContractRoleValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
        _contract: Yup.object().required("Wybierz kontrakt"),
    });
}

export function makeProjectRoleValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
        _project: Yup.object().required("Wybierz projekt"),
    });
}
