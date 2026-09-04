import * as Yup from "yup";
import MainSetup from "../React/MainSetupReact";

/**
 * Reguły pól konta wspólne dla ekranu użytkowników i panelu „Personel i uprawnienia".
 * Jedno miejsce, bo oba okna zapisują konto tą samą trasą (PUT /v2/persons/:id/account)
 * i serwer odrzuca te same przypadki - komunikat ma być identyczny w obu oknach.
 */

/** GLO-P1: jedna reguła, dwa pola - patrz komentarz przy systemEmail. */
export const FIDMAN_EMAIL_RULE = "fidman-wymaga-emaila-systemowego";
export const FIDMAN_EMAIL_MESSAGE = "Użytkownik FIDmana musi mieć e-mail systemowy";

export const accountFields = {
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

    // Konto w FIDmanie powstaje z e-maila systemowego - to on jest tożsamością logowania
    // Google. Serwer też odrzuca taki zapis (400 z tym samym komunikatem), ale problem ma
    // być widoczny tam, gdzie powstaje, czyli przy polu w formularzu.
    fidmanEnabled: Yup.boolean().test(FIDMAN_EMAIL_RULE, FIDMAN_EMAIL_MESSAGE, function (value) {
        if (!value) return true;
        return String(this.parent?.systemEmail ?? "").trim().length > 0;
    }),

    // Rola zakresowa bez przypisanego projektu nie zobaczy niczego (backend traktuje
    // pustą listę jako brak dostępu), więc konto bez projektów jest bezużyteczne.
    _projectAssignments: Yup.array().when("systemRoleId", {
        is: (systemRoleId: number) => MainSetup.isProjectScopedRoleId(systemRoleId),
        then: (schema) => schema.min(1, "Wskaż co najmniej jeden projekt"),
        otherwise: (schema) => schema.notRequired(),
    }),
};
