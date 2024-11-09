import * as Yup from "yup";

const commonFields = {
    _entity: Yup.object().required("Wybierz podmiot"),
    name: Yup.string().required("Podaj imię").max(50, "Imię może mieć maksymalnie 50 znaków"),

    surname: Yup.string().required("Podaj nazwisko").max(50, "Nazwisko może mieć maksymalnie 50 znaków"),

    position: Yup.string().required().max(200, "Stanowisko może mieć maksymalnie 200 znaków"),

    email: Yup.string()
        .default("")
        .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, "Nieprawidłowy format email")
        .max(50, "Email może mieć maksymalnie 50 znaków"),

    cellphone: Yup.string().max(25, "Numer komórki może mieć maksymalnie 25 znaków"),

    phone: Yup.string().max(25, "Numer telefonu może mieć maksymalnie 25 znaków"),

    comment: Yup.string().max(200, "Komentarz może mieć maksymalnie 200 znaków"),
};

export function makePersonValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
    });
}
