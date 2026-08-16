import * as Yup from "yup";
import MainSetup from "../../../React/MainSetupReact";

/** GLO-P1: jedna reguła, dwa pola - patrz komentarz przy systemEmail. */
const FIDMAN_EMAIL_RULE = "fidman-wymaga-emaila-systemowego";
export const FIDMAN_EMAIL_MESSAGE = "Użytkownik FIDmana musi mieć e-mail systemowy";

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

    systemEmail: Yup.string()
        .default("")
        .max(50, "Email może mieć maksymalnie 50 znaków")
        // Ta sama reguła co przy fidmanEnabled, celowo w dwóch miejscach: react-hook-form
        // w trybie onChange pokazuje błąd tylko przy polu, które użytkownik właśnie zmienił.
        // Gdyby reguła wisiała wyłącznie przy checkboksie, wyczyszczenie e-maila blokowałoby
        // zapis bez słowa wyjaśnienia - przycisk "Zatwierdź" po prostu przestałby działać.
        .test(FIDMAN_EMAIL_RULE, FIDMAN_EMAIL_MESSAGE, function (value) {
            if (!this.parent?.fidmanEnabled) return true;
            return String(value ?? "").trim().length > 0;
        }),

    systemRoleId: Yup.number().required("Wybierz rolę systemową"),

    // Konto w FIDmanie powstaje z e-maila systemowego - to on jest tożsamością logowania
    // Google. Serwer też odrzuca taki zapis (400 z tym samym komunikatem), ale problem ma
    // być widoczny tam, gdzie powstaje, czyli przy polu w formularzu.
    fidmanEnabled: Yup.boolean().test(
        FIDMAN_EMAIL_RULE,
        FIDMAN_EMAIL_MESSAGE,
        function (value) {
            if (!value) return true;
            return String(this.parent?.systemEmail ?? "").trim().length > 0;
        }
    ),

    // Rola zakresowa bez przypisanego projektu nie zobaczy niczego (backend traktuje
    // pustą listę jako brak dostępu), więc konto bez projektów jest bezużyteczne.
    _projectAssignments: Yup.array().when("systemRoleId", {
        is: (systemRoleId: number) => MainSetup.isProjectScopedRoleId(systemRoleId),
        then: (schema) => schema.min(1, "Wskaż co najmniej jeden projekt"),
        otherwise: (schema) => schema.notRequired(),
    }),
};

export function makeSystemUserValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
    });
}
