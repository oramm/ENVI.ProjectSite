/**
 * Reguła „użytkownik FIDmana wymaga e-maila systemowego" w modalu dodawania użytkownika.
 *
 * Przeniesione w PER-5 z testu skasowanego ekranu „Dodawanie użytkowników" (GLO-P1).
 * Reguła jest zapisana przy DWÓCH polach i to nie jest przypadek: react-hook-form w trybie
 * onChange pokazuje błąd tylko przy polu, które użytkownik właśnie zmienił. Gdy wisiała
 * wyłącznie przy checkboksie, wyczyszczenie e-maila blokowało zapis bez słowa wyjaśnienia -
 * przycisk „Zatwierdź" po prostu przestawał działać (zmierzone w przeglądarce 2026-08-16).
 * Dlatego test sprawdza obie ścieżki, nie samą sumę „schemat odrzuca".
 */
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../React/MainSetupReact", () => ({
    default: { isProjectScopedRoleId: () => false },
}));

import { makeUserValidationSchema } from "./UserValidationSchema";
import { FIDMAN_EMAIL_MESSAGE } from "../../../Persons/accountFieldsValidation";

const base = {
    _entity: { id: 1 },
    name: "Anna",
    surname: "Kowalska",
    position: "specjalista",
    email: "anna@envi.com.pl",
    systemRoleId: 5,
};

async function errorsFor(data: Record<string, unknown>): Promise<{ path: string; message: string }[]> {
    try {
        await makeUserValidationSchema(false).validate(data, { abortEarly: false });
        return [];
    } catch (error: any) {
        return (error.inner ?? []).map((e: any) => ({ path: e.path, message: e.message }));
    }
}

describe("UserValidationSchema - flaga użytkownika FIDmana", () => {
    it("flaga włączona bez e-maila systemowego jest odrzucana", async () => {
        const errors = await errorsFor({ ...base, systemEmail: "", fidmanEnabled: true });
        expect(errors.map((e) => e.message)).toContain(FIDMAN_EMAIL_MESSAGE);
    });

    it("komunikat pada przy OBU polach - inaczej byłby niewidoczny przy czyszczeniu e-maila", async () => {
        const errors = await errorsFor({ ...base, systemEmail: "", fidmanEnabled: true });
        const paths = errors.filter((e) => e.message === FIDMAN_EMAIL_MESSAGE).map((e) => e.path);
        expect(paths).toContain("systemEmail");
        expect(paths).toContain("fidmanEnabled");
    });

    it("sam odstęp to nie adres", async () => {
        const errors = await errorsFor({ ...base, systemEmail: "   ", fidmanEnabled: true });
        expect(errors.map((e) => e.message)).toContain(FIDMAN_EMAIL_MESSAGE);
    });

    it("flaga włączona z e-mailem systemowym przechodzi", async () => {
        const errors = await errorsFor({ ...base, systemEmail: "anna.kowalska@envi.com.pl", fidmanEnabled: true });
        expect(errors.map((e) => e.message)).not.toContain(FIDMAN_EMAIL_MESSAGE);
    });

    it("bez flagi brak e-maila systemowego nikomu nie przeszkadza", async () => {
        const errors = await errorsFor({ ...base, systemEmail: "", fidmanEnabled: false });
        expect(errors.map((e) => e.message)).not.toContain(FIDMAN_EMAIL_MESSAGE);
    });
});

describe("UserValidationSchema - rola przy zakładaniu", () => {
    it("pusty wybór roli daje czytelny komunikat, nie błąd typu", async () => {
        const errors = await errorsFor({ ...base, systemRoleId: "", systemEmail: "", fidmanEnabled: false });
        expect(errors.map((e) => e.message)).toContain("Wybierz rolę systemową");
    });
});
