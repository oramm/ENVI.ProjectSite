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

export const FIN_EMAIL_MESSAGE = "Użytkownik FIN musi mieć e-mail systemowy";

function accountEmailTest(flag: "fidmanEnabled" | "finEnabled", onEmail: boolean) {
    return {
        name: flag === "fidmanEnabled" ? FIDMAN_EMAIL_RULE : "fin-wymaga-emaila-systemowego",
        message: flag === "fidmanEnabled" ? FIDMAN_EMAIL_MESSAGE : FIN_EMAIL_MESSAGE,
        test(this: Yup.TestContext, value: unknown) {
            const enabled = onEmail ? this.parent?.[flag] : value;
            const email = onEmail ? value : this.parent?.systemEmail;
            return !enabled || String(email ?? "").trim().length > 0;
        },
    };
}

export const accountFields = {
    systemEmail: Yup.string()
        .default("")
        .max(50, "Email może mieć maksymalnie 50 znaków")
        // Ta sama reguła co przy fidmanEnabled i finEnabled, celowo w dwóch miejscach: react-hook-form
        // w trybie onChange pokazuje błąd tylko przy polu, które użytkownik właśnie zmienił.
        // Gdyby reguła wisiała wyłącznie przy checkboksie, wyczyszczenie e-maila blokowałoby
        // zapis bez słowa wyjaśnienia - przycisk "Zatwierdź" po prostu przestałby działać.
        .test(accountEmailTest("fidmanEnabled", true))
        .test(accountEmailTest("finEnabled", true)),

    // Konto powstaje z e-maila systemowego; błąd także przy zmienianym checkboxie.
    fidmanEnabled: Yup.boolean().test(accountEmailTest("fidmanEnabled", false)),
    finEnabled: Yup.boolean().test(accountEmailTest("finEnabled", false)),

    // Rola zakresowa bez przypisanego projektu nie zobaczy niczego (backend traktuje
    // pustą listę jako brak dostępu), więc konto bez projektów jest bezużyteczne.
    _projectAssignments: Yup.array().when("systemRoleId", {
        is: (systemRoleId: number) => MainSetup.isProjectScopedRoleId(systemRoleId),
        then: (schema) => schema.min(1, "Wskaż co najmniej jeden projekt"),
        otherwise: (schema) => schema.notRequired(),
    }),
};
