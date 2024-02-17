import * as Yup from "yup";

const commonFields = {
    name: Yup.string()
        .required("Podaj nazwę")
        .min(3, "Nazwa musi mieć co najmniej 3 znaki")
        .max(150, "Nazwa może mieć maksymalnie 150 znaków"),
    address: Yup.string().max(250, "Adres może mieć maksymalnie 250 znaków"),
    taxNumber: Yup.string()
        .nullable()
        .test("len", "Numer podatkowy musi mieć dokładnie 10 lub 13 znaków", (val) =>
            val ? val.length === 10 || val.length === 13 : true
        ),
    www: Yup.string().max(150, "WWW może mieć maksymalnie 150 znaków"),
    email: Yup.string()
        .nullable()
        .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, {
            message: "Nieprawidłowy format email",
            excludeEmptyString: true,
        })
        .max(80, "Email może mieć maksymalnie 80 znaków"),
    phone: Yup.string().max(25, "Telefon może mieć maksymalnie 25 znaków"),
};

export function makeEntityValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
    });
}
