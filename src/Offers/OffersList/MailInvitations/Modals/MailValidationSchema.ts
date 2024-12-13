import * as Yup from "yup";

const status = Yup.string().required("Wybierz status");

export function makeMailStatusValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        status,
    });
}
