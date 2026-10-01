import { describe, expect, it } from "vitest";
import type { SbOwnAccessView } from "../sbAccessApi";
import { describeLinkFailure, linkPanelMode, parseGithubLoginParam } from "../sbAccessView";

describe("Login GitHub z adresu", () => {
    it.each(["a", "osoba-gh", "Osoba123", "a".repeat(39)])("przyjmuje %s", login => {
        expect(parseGithubLoginParam(login)).toBe(login);
    });
    it.each(["@osoba-gh", "  osoba-gh  ", "  @osoba-gh  "])("przycina %s", value => {
        expect(parseGithubLoginParam(value)).toBe("osoba-gh");
    });
    it.each([null, "", "  ", "@", "a".repeat(40), "<script>", "osoba_gh", "osoba.gh", "a b", "-abc", "abc-", "a--b", "@@abc", "żaba"])("odrzuca %s", value => {
        expect(parseGithubLoginParam(value)).toBeNull();
    });
});

describe("Komunikat błędu powiązania", () => {
    it.each([
        [409, "Zaproszenie czeka - przyjmij je.", "Zaproszenie czeka - przyjmij je. Gdy to zrobisz, kliknij przycisk jeszcze raz."],
        [422, "Konto należy do innej osoby.", "Konto należy do innej osoby."],
        [409, "", "Nie udało się powiązać konta (kod 409)."],
        [422, "", "Nie udało się powiązać konta (kod 422)."],
        [409, "  ", "Nie udało się powiązać konta (kod 409)."],
        [503, "", "Powiązanie konta nie jest jeszcze dostępne - usługa nie została skonfigurowana po stronie PS. Instalator i tak możesz uruchomić; spróbuj ponownie później albo poproś przełożonego."],
        [502, "", "Nie udało się teraz sprawdzić konta w GitHubie. Spróbuj za chwilę."],
        [400, "", "Nazwa konta GitHub w adresie strony jest nieprawidłowa."],
        [401, "", "Nie masz dostępu do tej czynności. Zaloguj się ponownie albo poproś przełożonego."],
        [403, "", "Nie masz dostępu do tej czynności. Zaloguj się ponownie albo poproś przełożonego."],
        [0, "", "Brak połączenia z serwerem PS. Spróbuj ponownie."],
        [500, "", "Nie udało się powiązać konta (kod 500)."],
    ] as const)("opisuje kod %s", (status, message, expected) => {
        expect(describeLinkFailure(status, message)).toBe(expected);
    });
});

describe("Tryb panelu powiązania", () => {
    const sb: SbOwnAccessView = { status: "INVITED", githubState: "PENDING", githubLogin: null, driveState: "READY", isGrantedManually: false };
    it("nie pokazuje panelu bez loginu", () => expect(linkPanelMode(sb, null)).toBe("none"));
    it("nie pokazuje panelu dla ręcznego dostępu", () => expect(linkPanelMode({ ...sb, isGrantedManually: true }, "osoba-gh")).toBe("none"));
    it.each(["PENDING", "UNLINKED"] as const)("pyta o konto dla %s", githubState => expect(linkPanelMode({ ...sb, githubState }, "osoba-gh")).toBe("ask"));
    it.each(["osoba-gh", "OSOBA-GH"])("rozpoznaje powiązanie %s", githubLogin => expect(linkPanelMode({ ...sb, githubState: "LINKED", githubLogin }, "osoba-gh")).toBe("already"));
    it("ostrzega o innym koncie", () => expect(linkPanelMode({ ...sb, githubState: "LINKED", githubLogin: "inna-osoba" }, "osoba-gh")).toBe("other"));
});
