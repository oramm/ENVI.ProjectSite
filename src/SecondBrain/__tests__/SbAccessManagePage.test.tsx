import React from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MainSetup from "../../React/MainSetupReact";
import SbAccessManagePage from "../SbAccessManagePage";
import { fetchSbEntries, performSbAction, SbEntry, SbHealth } from "../sbManageApi";
import * as sbManageApi from "../sbManageApi";

const encryptMock = vi.fn(async (_jwk: unknown, _plain: string) => "SZYFR+base64==");
vi.mock("../sbSecretCrypto", () => ({ encryptSecretForKey: (jwk: unknown, plain: string) => encryptMock(jwk, plain) }));
vi.mock("../../View/Resultsets/CommonComponents", () => ({ AlertComponent: ({ message }: { message: string }) => <div role="alert">{message}</div> }));
const fetchMock = vi.fn();
const response = (body: unknown, status = 200) => ({ ok: status === 200, status, json: async () => body });
const row = (personId = 1, over: Partial<SbEntry> = {}): SbEntry => ({ id: personId, personId,
    name: "Anna", surname: `Nowak${personId}`, systemEmail: "anna@example.com", statusCode: "ACTIVE",
    githubLogin: null, githubInvitationId: null, drivePermissionId: null, isGrantedManually: false,
    createdAt: "", updatedAt: "", ...over });
let rows: SbEntry[], manage: boolean, operationStatus: number, operationBody: unknown, membersStatus: number;
const originalUrl = MainSetup.serverUrl;
beforeEach(() => {
    encryptMock.mockReset().mockResolvedValue("SZYFR+base64==");
    MainSetup.serverUrl = "http://localhost:3000/";
    rows = [row()]; manage = true; operationStatus = 200; operationBody = { result: "OK", note: "" }; membersStatus = 200;
    fetchMock.mockReset().mockImplementation(async (url: string, init?: RequestInit) => {
        if (init?.method) return response(operationBody, operationStatus);
        if (url.endsWith("/access")) return response({ canManage: manage, canSeeSb: false, sb: null });
        if (url.endsWith("/entries")) return response(rows);
        if (url.endsWith("/candidates")) return response([{ personId: 9, name: "Jan", surname: "Lis", systemEmail: "jan@example.com", systemRoleName: "ENVI_EMPLOYEE", statusCode: null }]);
        if (url.endsWith("/unlinked")) return response([{ login: "anna-gh", profileUrl: "https://github.com/anna-gh" }], membersStatus);
        if (url.endsWith("/events")) return response([]);
        if (url.endsWith("/mailboxes")) return response([{ code: "chocianow-ik", address: "chocianow.ik@envi.com.pl" }]);
        if (url.endsWith("/healthReport")) return { ok: true, status: 200, headers: { get: () => 'attachment; filename="raport-sb-nowak1-2026-10-19.json"' }, blob: async () => new Blob(["{}"]) };
        throw new Error(`Nieoczekiwana trasa: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); MainSetup.serverUrl = originalUrl; });
const renderPage = () => render(<SbAccessManagePage title="Dostęp do Second Brain" />);
const pick = async (n = 1) => fireEvent.click(await screen.findByRole("row", { name: new RegExp(`Nowak${n} Anna`) }));
const mutations = () => fetchMock.mock.calls.filter(call => call[1]?.method);

describe("Panel SB", () => {
    it("bez uprawnienia nie pyta tras zarządzania", async () => {
        manage = false; renderPage();
        await screen.findByText(/Znacznik nadaje się/);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole("button")).toBeNull();
    });
    it("pokazuje różne stany i blokuje dopiero po potwierdzeniu", async () => {
        rows = [row(), row(2, { statusCode: "INVITED" }), row(3, { statusCode: "BLOCKED" }), row(4, { statusCode: "REVOKED" })];
        renderPage();
        await screen.findByText(/Zaproszeni · 1/);
        expect(screen.getByText(/Pracownicy · 1/)).toBeVisible();
        expect(screen.getByText(/Zablokowani i odebrani · 2/)).toBeVisible();
        await pick(2); expect(screen.getByText("Zaproszony")).toBeVisible();
        await pick(3); expect(screen.getByText("Zablokowany")).toBeVisible();
        await pick(4); expect(screen.getByText("Odebrany")).toBeVisible();
        await pick(1); expect(screen.getByText("Aktywny")).toBeVisible();
        fireEvent.click(screen.getByRole("button", { name: "Zablokuj" }));
        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByText("To, co już pobrała na swój komputer (kopia wiedzy, skille), zostaje - zdalnego kasowania nie ma.")).toBeVisible();
        expect(mutations()).toHaveLength(0);
        fireEvent.click(within(dialog).getByRole("button", { name: "Zablokuj" }));
        await screen.findByText(/Wykonano: Blokada/);
        expect(mutations()[0]).toEqual(["http://localhost:3000/sbAccess/1/block", { method: "POST", credentials: "include" }]);
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(fetchMock.mock.calls.filter(call => call[0].endsWith("/entries"))).toHaveLength(2);
    });
    it("PARTIAL pokazuje żółte ostrzeżenie z uwagą", async () => {
        rows = [row(1, { statusCode: "BLOCKED" })]; operationBody = { result: "PARTIAL", note: "Dysk pozostał." };
        renderPage(); await pick(); fireEvent.click(await screen.findByRole("button", { name: "Odblokuj" }));
        const alert = await screen.findByRole("alert");
        expect(alert).toHaveClass("alert-warning"); expect(alert).toHaveTextContent("Dysk pozostał.");
    });
    it("503 operacji zostaje w potwierdzeniu i pozwala ponowić", async () => {
        operationStatus = 503; operationBody = { errorMessage: "Brak tokenu" };
        renderPage(); await pick(); fireEvent.click(await screen.findByRole("button", { name: "Zablokuj" }));
        fireEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Zablokuj" }));
        expect(await screen.findByText(/Funkcja nieskonfigurowana/)).toBeVisible();
        expect(within(screen.getByRole("dialog")).getByRole("button", { name: "Zablokuj" })).toBeEnabled();
    });
    it("ręczne nadania mają wyjaśnienie i historię bez zmiany stanu", async () => {
        rows = [row(1, { isGrantedManually: true })]; renderPage();
        await pick(); await screen.findByText(/Nadane ręcznie przed uruchomieniem/);
        expect(screen.queryByRole("button", { name: "Zablokuj" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Odbierz" })).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Historia zmian" }));
        expect(await screen.findByText("Brak zdarzeń.")).toBeVisible();
    });
    it("503 członków GitHuba nie zasłania rejestru", async () => {
        membersStatus = 503; renderPage();
        await screen.findByText("Funkcja nieskonfigurowana - nie można pobrać listy członków GitHub.");
        await pick(); expect(screen.getByText("Nowak1 Anna", { selector: "h2" })).toBeVisible();
        expect(screen.getByRole("button", { name: "Zablokuj" })).toBeEnabled();
    });
    it("przypisuje konto przez PUT i odświeża listy", async () => {
        renderPage(); const select = await screen.findByRole("combobox", { name: "Osoba dla anna-gh" });
        expect(screen.getByRole("button", { name: "Przypisz" })).toBeDisabled();
        fireEvent.change(select, { target: { value: "1" } }); fireEvent.click(screen.getByRole("button", { name: "Przypisz" }));
        await screen.findByText(/Wykonano: Przypisanie/);
        expect(mutations()[0]).toEqual(["http://localhost:3000/sbAccess/1/githubAccount", {
            method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: '{"githubLogin":"anna-gh"}',
        }]);
    });
    it("tabela grupuje wg roli i pokazuje poziomy, a panel wysyła PUT z poziomami i skrzynkami", async () => {
        rows = [row(1, { canManageSb: true, levels: { repos: "read", psDb: "none", drive: "connector", mail: ["faktury"] } as never }), row(2)]; renderPage();
        await screen.findByText(/Administratorzy SB · 1/); expect(screen.getByText(/Pracownicy · 1/)).toBeVisible();
        expect(screen.getByText("odczyt")).toBeVisible(); expect(screen.getByText("faktury")).toBeVisible(); expect(screen.queryByText("konektor")).toBeNull(); expect(screen.queryByRole("columnheader", { name: "Dysk" })).toBeNull();
        expect(screen.getByText("Hasła")).toBeVisible(); expect(screen.getByRole("columnheader", { name: "Komputer" })).toBeVisible();
        await pick();
        const panel = screen.getByLabelText("Panel osoby");
        fireEvent.change(within(panel).getByLabelText("Repozytoria"), { target: { value: "write" } });
        fireEvent.change(within(panel).getByLabelText("Baza PS"), { target: { value: "ro" } });
        fireEvent.click(within(panel).getByLabelText("Skrzynka chocianow-ik"));
        fireEvent.click(within(panel).getByLabelText("Skrzynka faktury"));
        fireEvent.click(within(panel).getByRole("button", { name: "Zapisz uprawnienia" }));
        await screen.findByText(/Zapisano uprawnienia/);
        expect(mutations()[0]).toEqual(["http://localhost:3000/sbAccess/1/levels", {
            method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
            body: '{"repos":"write","psDb":"ro","mail":["chocianow-ik"]}',
        }]);
    });
    it("kolumna Hasła: X z Y wg uprawnień, kreska gdy nic się nie należy; bez klucza panel blokuje udostępnienie", async () => {
        rows = [row(1, { secretsExpected: ["poczta-faktury", "baza-ps"], secretsGiven: ["baza-ps"], keyFingerprint: null }), row(2, { secretsExpected: [] })];
        renderPage();
        expect(await screen.findByText("1 z 2")).toBeVisible(); expect(screen.getByText("—")).toBeVisible();
        await pick();
        const section = within(screen.getByLabelText("Panel osoby")).getByRole("region", { name: "Hasła" });
        expect(within(section).getByText("brak klucza")).toBeVisible();
        expect(within(section).getByText(/dopiero po uruchomieniu instalatora/)).toBeVisible();
        expect(within(section).getByRole("button", { name: "Udostępnij hasło…" })).toBeDisabled();
    });
    it("udostępnienie: szyfruje kluczem osoby, wysyła tylko szyfr i odcisk, czyści pole", async () => {
        const jwk = { kty: "RSA" as const, n: "n-klucza", e: "AQAB" as const };
        rows = [row(1, { publicKeyJwk: jwk, keyThumbprint: "a".repeat(64), keyFingerprint: "aaaa aaaa",
            secretsExpected: ["poczta-faktury", "baza-ps"], secretsGiven: ["poczta-faktury"] })];
        renderPage(); await pick();
        const section = within(screen.getByLabelText("Panel osoby")).getByRole("region", { name: "Hasła" });
        expect(within(section).getByText("aaaa aaaa")).toBeVisible();
        expect(within(section).getByText(/PS zapisuje tylko szyfr/)).toBeVisible();
        fireEvent.click(within(section).getByRole("button", { name: "Udostępnij hasło…" }));
        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByLabelText("Hasło do")).toHaveValue("baza-ps");
        const field = within(dialog).getByLabelText("Hasło");
        expect(field).toHaveAttribute("type", "password");
        fireEvent.change(field, { target: { value: "Tajne-Haslo-1" } });
        fireEvent.change(within(dialog).getByLabelText("Powtórz hasło"), { target: { value: "Tajne-Haslo-1" } });
        fireEvent.click(within(dialog).getByRole("button", { name: /Zaszyfruj i udostępnij/ }));
        await within(dialog).findByText("Udostępniono");
        expect(encryptMock).toHaveBeenCalledWith(jwk, "Tajne-Haslo-1");
        expect(mutations()[0]).toEqual(["http://localhost:3000/sbAccess/1/secrets/baza-ps", {
            method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ciphertext: "SZYFR+base64==", keyThumbprint: "a".repeat(64) }),
        }]);
        expect(JSON.stringify(fetchMock.mock.calls)).not.toContain("Tajne-Haslo-1");
        await waitFor(() => expect(field).toHaveValue(""));
        expect(within(dialog).getByLabelText("Powtórz hasło")).toHaveValue("");
        fireEvent.click(within(dialog).getByRole("button", { name: "Zamknij" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        fireEvent.click(within(screen.getByLabelText("Panel osoby")).getByRole("button", { name: "Udostępnij hasło…" }));
        expect(within(await screen.findByRole("dialog")).getByLabelText("Hasło")).toHaveValue("");
    });
    it("błąd udostępnienia zostaje w dialogu, a pole hasła i tak jest czyszczone", async () => {
        operationStatus = 409; operationBody = { errorMessage: "Klucz komputera pracownika zmienił się." };
        rows = [row(1, { publicKeyJwk: { kty: "RSA", n: "n", e: "AQAB" }, keyThumbprint: "b".repeat(64), keyFingerprint: "bbbb bbbb", secretsExpected: ["baza-ps"], secretsGiven: [] })];
        renderPage(); await pick();
        fireEvent.click(screen.getByRole("button", { name: "Udostępnij hasło…" }));
        const dialog = await screen.findByRole("dialog");
        fireEvent.change(within(dialog).getByLabelText("Hasło"), { target: { value: "x" } });
        fireEvent.change(within(dialog).getByLabelText("Powtórz hasło"), { target: { value: "x" } });
        fireEvent.click(within(dialog).getByRole("button", { name: /Zaszyfruj i udostępnij/ }));
        expect(await within(dialog).findByText("Błąd: Klucz komputera pracownika zmienił się.")).toBeVisible();
        expect(within(dialog).getByLabelText("Hasło")).toHaveValue("");
    });
    it("odebranie hasła dopiero po potwierdzeniu z przypomnieniem o zmianie hasła u źródła", async () => {
        rows = [row(1, { publicKeyJwk: { kty: "RSA", n: "n", e: "AQAB" }, keyThumbprint: "c".repeat(64), keyFingerprint: "cccc cccc", secretsExpected: ["poczta-faktury"], secretsGiven: ["poczta-faktury"] })];
        operationBody = { name: "poczta-faktury", given: false };
        renderPage(); await pick();
        fireEvent.click(within(screen.getByRole("region", { name: "Hasła" })).getByRole("button", { name: "Odbierz" }));
        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByText(/zmień hasło u źródła/)).toBeVisible();
        expect(mutations()).toHaveLength(0);
        fireEvent.click(within(dialog).getByRole("button", { name: "Odbierz hasło" }));
        await screen.findByText(/Odebrano hasło \(poczta: faktury\)/);
        expect(mutations()[0]).toEqual(["http://localhost:3000/sbAccess/1/secrets/poczta-faktury", { method: "DELETE", credentials: "include" }]);
    });
    it("zaproszenie pokazuje adres i wysyła POST bez treści", async () => {
        renderPage(); fireEvent.click(await screen.findByRole("button", { name: "Zaproś osobę" }));
        const dialog = await screen.findByRole("dialog");
        fireEvent.change(within(dialog).getByRole("combobox"), { target: { value: "9" } });
        expect(within(dialog).getByText("jan@example.com")).toBeVisible();
        fireEvent.click(within(dialog).getByRole("button", { name: "Wyślij zaproszenie" }));
        await screen.findByText(/Wykonano: Zaproszenie/);
        expect(mutations()[0]).toEqual(["http://localhost:3000/sbAccess/9/invite", { method: "POST", credentials: "include" }]);
    });
});
describe("Panel SB - Komputer", () => {
        const sbHealth = (over: Partial<SbHealth> = {}): SbHealth => ({
            reportedAt: new Date().toISOString(), state: "ok", stale: false, refreshRequested: false, sbVersion: "1.14", installerVersion: "0.16.0",
            tools: [{ name: "poczta-faktury", ok: true }, { name: "baza-ps", ok: true }], events: [], ...over });
        const computer = () => within(screen.getByLabelText("Panel osoby")).getByRole("region", { name: "Komputer" });
        it("kolumna pokazuje wszystkie cztery stany i zdanie o raporcie raz dziennie i 7 dniach", async () => {
            rows = [row(1), row(2, { health: sbHealth() }), row(3, { health: sbHealth({ state: "fail", tools: [{ name: "baza-ps", ok: false, error: "x" }] }) }),
                row(4, { health: sbHealth({ stale: true, reportedAt: new Date(Date.now() - 9 * 864e5).toISOString() }) })];
            renderPage();
            const table = await screen.findByRole("table");
            expect(within(table).getByRole("columnheader", { name: "Komputer" })).toBeVisible();
            for (const [n, text] of [[1, "nie zainstalowano"], [2, "działa"], [3, "błąd"], [4, "brak raportu"]] as const)
                expect(within(screen.getByRole("row", { name: new RegExp(`Nowak${n} Anna`) })).getByText(text)).toBeVisible();
            expect(within(screen.getByRole("row", { name: /Nowak1 Anna/ })).queryByText(/dziś|\d\d\.\d\d/)).toBeNull();
            expect(within(screen.getByRole("row", { name: /Nowak2 Anna/ })).getByText(/^dziś \d\d:\d\d$/)).toBeVisible();
            expect(screen.getByText(/wysyłany raz dziennie.*starszy niż 7 dni jest szary/)).toBeVisible();
        });
        it("bez raportu: panel mówi, że instalator nie był uruchomiony; pobranie wyłączone, prośba możliwa", async () => {
            renderPage(); await pick();
            expect(within(computer()).getByText(/nie uruchomił jeszcze instalatora SB/)).toBeVisible();
            expect(within(computer()).getByRole("button", { name: "Pobierz raport diagnostyczny" })).toBeDisabled();
            expect(within(computer()).getByRole("button", { name: "Poproś o świeży raport" })).toBeEnabled();
        });
        it("z błędem: wersje, lista narzędzi działa/błąd, log w ramce, zdanie o zawartości raportu", async () => {
            rows = [row(1, { health: sbHealth({ state: "fail", tools: [{ name: "poczta-faktury", ok: true }, { name: "baza-ps", ok: false, error: "logowanie odrzucone" }],
                events: ["18.10 17:40  baza PS: logowanie odrzucone (hasło nieaktualne)"] }) })];
            renderPage(); await pick();
            const section = computer();
            expect(within(section).getByText(/^SB 1.14 · instalator 0.16.0 · raport dziś/)).toBeVisible();
            expect(within(section).getByText("poczta: faktury")).toBeVisible(); expect(within(section).getByText("baza PS")).toBeVisible();
            expect(within(section).getByText("działa")).toBeVisible(); expect(within(section).getByText("błąd")).toBeVisible();
            expect(within(section).getByLabelText("Log komputera")).toHaveTextContent("baza PS: logowanie odrzucone (hasło nieaktualne)");
            expect(within(section).getByText("Raport zawiera tylko wersje, stan narzędzi i krótkie opisy błędów. Bez haseł i bez treści poczty.")).toBeVisible();
        });
        it("bez problemów: komunikat zamiast logu; raport sprzed 7 dni ma szarą plakietkę", async () => {
            rows = [row(1, { health: sbHealth() }), row(2, { health: sbHealth({ stale: true }) })];
            renderPage(); await pick();
            expect(within(computer()).getByText("Brak problemów w ostatnim raporcie.")).toBeVisible();
            expect(within(computer()).queryByLabelText("Log komputera")).toBeNull();
            await pick(2);
            expect(within(computer()).getByText(/Raport jest starszy niż 7 dni/)).toBeVisible();
        });
        it("prośba o świeży raport: POST bez treści, odświeża listę i pokazuje, że prośba czeka", async () => {
            operationBody = { requested: true, alreadyPending: false };
            renderPage(); await pick();
            fireEvent.click(within(computer()).getByRole("button", { name: "Poproś o świeży raport" }));
            await waitFor(() => expect(mutations()).toHaveLength(1));
            expect(mutations()[0]).toEqual(["http://localhost:3000/sbAccess/1/healthRequest", { method: "POST", credentials: "include" }]);
            await waitFor(() => expect(fetchMock.mock.calls.filter(call => call[0].endsWith("/entries"))).toHaveLength(2));
        });
        it("prośba czeka: plakietka i zablokowany przycisk; zablokowana osoba nie dostaje prośby", async () => {
            rows = [row(1, { health: sbHealth({ refreshRequested: true }) }), row(2, { statusCode: "BLOCKED" })];
            renderPage(); await pick();
            expect(within(computer()).getByText("prośba czeka")).toBeVisible();
            expect(within(computer()).getByRole("button", { name: "Poproś o świeży raport" })).toBeDisabled();
            await pick(2);
            expect(within(computer()).getByRole("button", { name: "Poproś o świeży raport" })).toBeDisabled();
        });
        it("błąd prośby zostaje w sekcji", async () => {
            operationStatus = 409; operationBody = { errorMessage: "Osoba nie ma aktywnego dostępu do Second Brain." };
            renderPage(); await pick();
            fireEvent.click(within(computer()).getByRole("button", { name: "Poproś o świeży raport" }));
            expect(await within(computer()).findByText("Osoba nie ma aktywnego dostępu do Second Brain.")).toBeVisible();
        });
        it("pobranie raportu: GET z ciasteczkiem i plik pod nazwą z PS", async () => {
            rows = [row(1, { health: sbHealth() })];
            const create = vi.fn(() => "blob:raport"), revoke = vi.fn();
            vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }));
            const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
            renderPage(); await pick();
            let download = "";
            const append = vi.spyOn(document.body, "appendChild").mockImplementation(node => { download = (node as HTMLAnchorElement).download; return node; });
            fireEvent.click(within(computer()).getByRole("button", { name: "Pobierz raport diagnostyczny" }));
            await waitFor(() => expect(click).toHaveBeenCalled());
            expect(fetchMock.mock.calls.find(call => call[0].endsWith("/healthReport"))).toEqual(["http://localhost:3000/sbAccess/1/healthReport", { credentials: "include" }]);
            expect(download).toBe("raport-sb-nowak1-2026-10-19.json");
            expect(revoke).toHaveBeenCalledWith("blob:raport");
            append.mockRestore(); click.mockRestore();
        });
});
describe("API zarządzania SB", () => {
    it.each([null, {}, { result: "FAILED", note: "Nie wykonano" }])("nie rzuca i nie ogłasza sukcesu nieprawidłowej odpowiedzi %s", async body => {
        fetchMock.mockResolvedValue(response(body));
        expect(await performSbAction(1, "invite")).toEqual({ ok: false, status: 200, message: "Nieprawidłowa odpowiedź serwera PS." });
    });
    it("zwraca błąd sieci bez wyjątku", async () => {
        fetchMock.mockRejectedValue(new Error("Sieć"));
        expect(await fetchSbEntries()).toEqual({ ok: false, status: 0, message: "" });
        expect(await performSbAction(1, "invite")).toEqual({ ok: false, status: 0, message: "" });
    });
    it("zachowuje kod bez JSON i wiadomość serwera", async () => {
        fetchMock.mockResolvedValueOnce({ status: 502, json: async () => { throw new Error("HTML"); } })
            .mockResolvedValueOnce(response({ errorMessage: "Odmowa" }, 409));
        expect(await fetchSbEntries()).toEqual({ ok: false, status: 502, message: "" });
        expect(await performSbAction(1, "invite")).toEqual({ ok: false, status: 409, message: "Odmowa" });
    });
});

describe("Panel SB - Hasła wspólne", () => {
    const keyedRow = (id: number, over: Partial<SbEntry> = {}) => row(id, {
        publicKeyJwk: { kty: "RSA", n: `key-${id}`, e: "AQAB" }, keyThumbprint: `thumb-${id}`, keyFingerprint: `finger-${id}`,
        secretsExpected: ["baza-ps"], secretsGiven: [], ...over,
    });
    const openCommon = async () => {
        renderPage(); await screen.findByRole("table");
        fireEvent.click(screen.getByRole("button", { name: "Hasła wspólne" }));
        return screen.findByRole("dialog");
    };
    const fill = (dialog: HTMLElement, value = "haslo-test-123") => {
        fireEvent.change(within(dialog).getByLabelText("Hasło"), { target: { value } });
        fireEvent.change(within(dialog).getByLabelText("Powtórz hasło"), { target: { value } });
    };
    const send = (dialog: HTMLElement) => within(dialog).getByRole("button", { name: /Zaszyfruj i udostępnij/ });
    const person = (dialog: HTMLElement, id: number) => within(dialog).getByRole("checkbox", { name: new RegExp(`Nowak${id} Anna`) });
    it("pokazuje różnicę dopiero po wpisaniu powtórzenia, tuż pod polem i z powiązaniem ARIA", async () => {
        rows = Array.from({ length: 20 }, (_, i) => keyedRow(i + 1));
        const dialog = await openCommon();
        const password = within(dialog).getByLabelText("Hasło"), repeated = within(dialog).getByLabelText("Powtórz hasło");
        expect(within(dialog).queryByRole("alert")).toBeNull();
        fireEvent.change(password, { target: { value: "a" } });
        expect(within(dialog).queryByRole("alert")).toBeNull();
        expect(repeated).toHaveAttribute("aria-invalid", "false");
        expect(send(dialog)).toBeDisabled();
        fireEvent.submit(send(dialog).closest("form")!);
        expect(mutations()).toHaveLength(0); expect(encryptMock).not.toHaveBeenCalled();
        fireEvent.change(repeated, { target: { value: "b" } });
        const error = within(dialog).getByRole("alert");
        expect(error).toHaveTextContent("Hasła różnią się");
        expect(repeated.nextElementSibling).toBe(error);
        expect(error.closest(".modal-body")).not.toBeNull();
        expect(repeated).toHaveAttribute("aria-describedby", error.id);
        expect(repeated).toHaveAttribute("aria-invalid", "true");
        expect(send(dialog)).toBeDisabled();
        fireEvent.change(repeated, { target: { value: "a" } });
        expect(within(dialog).queryByRole("alert")).toBeNull();
        expect(repeated).toHaveAttribute("aria-invalid", "false");
        expect(repeated).not.toHaveAttribute("aria-describedby");
        expect(send(dialog)).toBeEnabled();
        fireEvent.change(repeated, { target: { value: "" } });
        expect(within(dialog).queryByRole("alert")).toBeNull();
        expect(send(dialog)).toBeDisabled();
        fireEvent.change(password, { target: { value: "ż".repeat(96) } });
        expect(within(dialog).getByRole("alert")).toHaveTextContent("za długie");
        expect(send(dialog)).toBeDisabled();
    });
    it("wyjaśnia brak czekających i pozwala wysłać wszystkim po włączeniu zmiany hasła", async () => {
        rows = [keyedRow(1, { secretsExpected: ["baza-ps", "poczta-faktury"], secretsGiven: ["baza-ps", "poczta-faktury"] }),
            keyedRow(2, { secretsGiven: ["baza-ps"] })];
        const dialog = await openCommon(); fill(dialog);
        const hint = "Nikt nie czeka na to hasło - włącz 'Hasło zmieniło się u źródła', żeby wysłać je ponownie.";
        expect(within(dialog).getByText(hint)).toBeVisible();
        expect(send(dialog)).toBeDisabled();
        const changed = within(dialog).getByLabelText(/Hasło zmieniło się u źródła/);
        fireEvent.click(changed);
        expect(within(dialog).queryByText(hint)).toBeNull();
        expect(person(dialog, 1)).toBeChecked(); expect(person(dialog, 2)).toBeChecked();
        expect(send(dialog)).toBeEnabled();
        fireEvent.click(changed);
        expect(within(dialog).getByText(hint)).toBeVisible();
        expect(send(dialog)).toBeDisabled();
        fireEvent.change(within(dialog).getByLabelText("Hasło do"), { target: { value: "poczta-faktury" } });
        expect(within(dialog).getByText(hint)).toBeVisible();
    });
    it("gdy czeka tylko osoba bez klucza, wyjaśnia przełącznik i instalator", async () => {
        rows = [keyedRow(1, { secretsGiven: ["baza-ps"] }), keyedRow(2, { publicKeyJwk: null })];
        const dialog = await openCommon(); fill(dialog);
        expect(within(dialog).getByText(/Nikt nie czeka.*Osoby bez klucza komputera dostaną je dopiero po uruchomieniu instalatora/)).toBeVisible();
        expect(within(dialog).getByText(/po uruchomieniu instalatora u tej osoby/)).toBeVisible();
        expect(send(dialog)).toBeDisabled();
    });
    it.each([true, false])("zostawia podsumowanie po zamknięciu i zastępuje stary stan wynikiem (sukces: %s)", async ok => {
        rows = [keyedRow(1, { secretsGiven: ["baza-ps"] }), keyedRow(2, { secretsGiven: ["baza-ps"] })];
        vi.spyOn(sbManageApi, "giveSbSecret").mockResolvedValue(ok
            ? { ok: true, data: { name: "baza-ps", given: true } }
            : { ok: false, status: 409, message: "Klucz zmieniony." });
        const dialog = await openCommon();
        const resultsRegion = within(dialog).getByRole("group", { name: "Osoby" });
        expect(resultsRegion).toHaveAttribute("aria-live", "polite");
        fireEvent.click(within(dialog).getByLabelText(/Hasło zmieniło się u źródła/));
        fill(dialog); fireEvent.click(send(dialog));
        await waitFor(() => expect(within(dialog).getByRole("button", { name: "Zamknij" })).toBeEnabled());
        expect(resultsRegion).toHaveFocus();
        expect(within(dialog).getByRole("group", { name: "Osoby" })).toBe(resultsRegion);
        expect(within(dialog).getAllByText(ok ? "Udostępniono" : "Błąd: Klucz zmieniony.")).toHaveLength(2);
        expect(within(dialog).queryByText("Już udostępnione")).toBeNull();
        expect(within(dialog).queryByText("Czeka na udostępnienie")).toBeNull();
        expect(dialog.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);
        expect(within(dialog).queryByRole("status")).toBeNull();
        fireEvent.click(within(dialog).getByRole("button", { name: "Zamknij" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        const summary = screen.getByRole("alert");
        expect(summary).toHaveClass(ok ? "alert-success" : "alert-danger");
        expect(summary).toHaveTextContent(ok ? "Udostępniono hasło (baza PS) - liczba osób: 2. Błędy: 0." : "Nie udostępniono hasła (baza PS) nikomu. Błędy: 2.");
    });
    it("sumuje nazwy, pokazuje uprawnione osoby, zaznacza czekających i przełącza rotację", async () => {
        rows = [keyedRow(1, { secretsExpected: ["baza-ps", "poczta-faktury"] }), keyedRow(2, { secretsGiven: ["baza-ps"] }),
            keyedRow(3, { publicKeyJwk: null }), keyedRow(4, { secretsExpected: ["poczta-faktury"], secretsGiven: ["poczta-stara"] }),
            keyedRow(5, { keyThumbprint: null })];
        const dialog = await openCommon();
        expect(within(dialog).getAllByRole("option").map(option => option.textContent)).toEqual(["baza PS", "poczta: faktury"]);
        expect(person(dialog, 1)).toBeChecked(); expect(person(dialog, 2)).not.toBeChecked();
        expect(person(dialog, 3)).toBeDisabled(); expect(person(dialog, 3)).not.toBeChecked();
        expect(person(dialog, 5)).toBeDisabled(); expect(person(dialog, 5)).not.toBeChecked();
        expect(within(dialog).queryByRole("checkbox", { name: /Nowak4 Anna/ })).toBeNull();
        expect(within(dialog).getAllByText(/po uruchomieniu instalatora u tej osoby/)).toHaveLength(2);
        const changed = within(dialog).getByLabelText(/Hasło zmieniło się u źródła/);
        fireEvent.click(changed);
        expect(person(dialog, 1)).toBeChecked(); expect(person(dialog, 2)).toBeChecked();
        expect(person(dialog, 3)).not.toBeChecked(); expect(person(dialog, 5)).not.toBeChecked();
        fireEvent.click(changed); expect(person(dialog, 2)).not.toBeChecked();
        fill(dialog);
        fireEvent.change(within(dialog).getByLabelText("Hasło do"), { target: { value: "poczta-faktury" } });
        expect(person(dialog, 1)).toBeChecked(); expect(person(dialog, 4)).toBeChecked();
        expect(within(dialog).queryByRole("checkbox", { name: /Nowak2 Anna/ })).toBeNull();
        expect(within(dialog).getByLabelText("Hasło")).toHaveValue("");
        expect(within(dialog).getByLabelText("Powtórz hasło")).toHaveValue("");
        expect(changed).not.toBeChecked();
    });
    it("blokuje różne i za długie hasła oraz brak osób, liczy znaki, czyści oba pola po zamknięciu", async () => {
        rows = [keyedRow(1)];
        const dialog = await openCommon();
        expect(send(dialog)).toBeDisabled(); expect(within(dialog).getByText("Liczba znaków: 0")).toBeVisible();
        fill(dialog, "a".repeat(14));
        expect(send(dialog)).toBeEnabled(); expect(within(dialog).getByText("Liczba znaków: 14")).toBeVisible();
        fireEvent.change(within(dialog).getByLabelText("Powtórz hasło"), { target: { value: "inne" } });
        expect(send(dialog)).toBeDisabled(); expect(within(dialog).getByRole("alert")).toHaveTextContent("Hasła różnią się");
        fireEvent.submit(send(dialog).closest("form")!);
        expect(mutations()).toHaveLength(0); expect(encryptMock).not.toHaveBeenCalled();
        fill(dialog, "ż".repeat(96));
        expect(send(dialog)).toBeDisabled(); expect(within(dialog).getByRole("alert")).toHaveTextContent("za długie");
        fill(dialog); fireEvent.click(person(dialog, 1)); expect(send(dialog)).toBeDisabled();
        fireEvent.click(within(dialog).getByRole("button", { name: "Zamknij" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        fireEvent.click(screen.getByRole("button", { name: "Hasła wspólne" }));
        const reopened = await screen.findByRole("dialog");
        expect(within(reopened).getByLabelText("Hasło")).toHaveValue("");
        expect(within(reopened).getByLabelText("Powtórz hasło")).toHaveValue("");
        expect(person(reopened, 1)).toBeChecked();
    });
    it("wysyła kolejno, 409 nie zatrzymuje reszty, daje wyniki każdej osoby i odświeża listę", async () => {
        rows = [keyedRow(1), keyedRow(2), keyedRow(3, { secretsGiven: ["baza-ps"] }), keyedRow(4, { keyThumbprint: null })];
        let finishFirst!: (result: Awaited<ReturnType<typeof sbManageApi.giveSbSecret>>) => void;
        const give = vi.spyOn(sbManageApi, "giveSbSecret")
            .mockImplementationOnce(() => new Promise(resolve => { finishFirst = resolve; }))
            .mockResolvedValueOnce({ ok: true, data: { name: "baza-ps", given: true } });
        encryptMock.mockImplementation(async jwk => `szyfr-${(jwk as { n: string }).n}`);
        const dialog = await openCommon(); fill(dialog, "tajne-testowe");
        fireEvent.click(send(dialog));
        await waitFor(() => expect(give).toHaveBeenCalledTimes(1));
        expect(give).toHaveBeenNthCalledWith(1, 1, "baza-ps", "szyfr-key-1", "thumb-1");
        expect(encryptMock).toHaveBeenCalledTimes(1); expect(send(dialog)).toBeDisabled();
        expect(within(dialog).getByRole("button", { name: "Zamknij" })).toBeDisabled();
        finishFirst({ ok: false, status: 409, message: "Klucz komputera pracownika zmienił się." });
        expect(await within(dialog).findByText("Błąd: Klucz komputera pracownika zmienił się.")).toBeVisible();
        expect(await within(dialog).findByText("Udostępniono")).toBeVisible();
        expect(give).toHaveBeenCalledTimes(2);
        expect(give).toHaveBeenNthCalledWith(2, 2, "baza-ps", "szyfr-key-2", "thumb-2");
        expect(encryptMock.mock.calls.map(call => call[0])).toEqual([rows[0].publicKeyJwk, rows[1].publicKeyJwk]);
        expect(JSON.stringify(give.mock.calls)).not.toContain("tajne-testowe");
        await waitFor(() => expect(within(dialog).getByLabelText("Hasło")).toHaveValue(""));
        expect(within(dialog).getByLabelText("Powtórz hasło")).toHaveValue("");
        await waitFor(() => expect(fetchMock.mock.calls.filter(call => call[0].endsWith("/entries"))).toHaveLength(2));
        await waitFor(() => expect(within(dialog).getByRole("group", { name: "Osoby" })).toHaveFocus());
        expect(within(dialog).queryByRole("status")).toBeNull();
        fireEvent.click(within(dialog).getByRole("button", { name: "Zamknij" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        const summary = screen.getByRole("alert");
        expect(summary).toHaveClass("alert-warning");
        expect(summary).toHaveTextContent("Udostępniono hasło (baza PS) - liczba osób: 1. Błędy: 1.");
    });
    it("błąd szyfrowania jednej osoby nie zatrzymuje wysyłki następnej", async () => {
        rows = [keyedRow(1), keyedRow(2)];
        encryptMock.mockRejectedValueOnce(new Error("importKey failed"));
        const give = vi.spyOn(sbManageApi, "giveSbSecret").mockResolvedValue({ ok: true, data: { name: "baza-ps", given: true } });
        const dialog = await openCommon(); fill(dialog); fireEvent.click(send(dialog));
        expect(await within(dialog).findByText(/Błąd: Nie udało się zaszyfrować lub wysłać/)).toBeVisible();
        expect(await within(dialog).findByText("Udostępniono")).toBeVisible();
        expect(give).toHaveBeenCalledExactlyOnceWith(2, "baza-ps", "SZYFR+base64==", "thumb-2");
        await waitFor(() => expect(within(dialog).getByLabelText("Hasło")).toHaveValue(""));
        expect(within(dialog).getByLabelText("Powtórz hasło")).toHaveValue("");
    });
    it("wejście od osoby używa tego samego okna, zaznacza tylko ją także przy podmianie", async () => {
        rows = [keyedRow(1, { secretsGiven: ["baza-ps"] }), keyedRow(2)];
        const give = vi.spyOn(sbManageApi, "giveSbSecret").mockResolvedValue({ ok: true, data: { name: "baza-ps", given: true } });
        renderPage(); await pick(); fireEvent.click(screen.getByRole("button", { name: "Udostępnij hasło…" }));
        const dialog = await screen.findByRole("dialog");
        expect(person(dialog, 1)).toBeChecked();
        expect(within(dialog).queryByRole("checkbox", { name: /Nowak2 Anna/ })).toBeNull();
        fill(dialog); fireEvent.click(send(dialog));
        await within(dialog).findByText("Udostępniono");
        expect(give).toHaveBeenCalledExactlyOnceWith(1, "baza-ps", "SZYFR+base64==", "thumb-1");
    });
    it("błąd odświeżenia listy po wysyłce nie chowa jej wyników", async () => {
        rows = [keyedRow(1)];
        const dialog = await openCommon();
        vi.spyOn(sbManageApi, "giveSbSecret").mockResolvedValue({ ok: true, data: { name: "baza-ps", given: true } });
        vi.spyOn(sbManageApi, "fetchSbEntries").mockResolvedValue({ ok: false, status: 0, message: "" });
        fill(dialog); fireEvent.click(send(dialog));
        await screen.findByText("Brak połączenia z serwerem PS. Spróbuj ponownie.");
        expect(person(dialog, 1)).toBeVisible();
        expect(within(dialog).getByText("Udostępniono")).toBeVisible();
        expect(within(dialog).getByLabelText("Hasło")).toHaveValue("");
        expect(within(dialog).getByLabelText("Powtórz hasło")).toHaveValue("");
        expect(within(dialog).getByRole("button", { name: "Zamknij" })).toBeEnabled();
    });
    it.each([
        { ok: true, error: undefined, expected: "działają na komputerze" },
        { ok: false, error: "baza PS: hasło z PS odrzucone przez serwer, zostało poprzednie", expected: "baza PS: hasło z PS odrzucone przez serwer, zostało poprzednie" },
        { ok: false, error: undefined, expected: "Nie udało się pobrać lub sprawdzić haseł z PS na komputerze." },
    ])("pokazuje stan haseł i datę już pobranego raportu: $expected", async ({ ok, error, expected }) => {
        rows = [keyedRow(1, { health: {
            reportedAt: new Date().toISOString(), state: ok ? "ok" : "fail", stale: false, refreshRequested: false,
            sbVersion: "1", installerVersion: "1", tools: [{ name: "hasla-z-ps", ok, error }], events: [],
        } })];
        renderPage(); await pick();
        const section = screen.getByRole("region", { name: "Hasła" });
        expect(within(section).getByRole("status")).toHaveTextContent(expected);
        expect(within(section).getByRole("status")).toHaveTextContent(/\(raport dziś \d\d:\d\d\)/);
        expect(within(screen.getByRole("region", { name: "Komputer" })).getByText("Hasła z PS na komputerze")).toBeVisible();
        expect(fetchMock.mock.calls).toHaveLength(5);
    });
    it("bez hasla-z-ps nie wymyśla stanu działania haseł", async () => {
        rows = [keyedRow(1)]; renderPage(); await pick();
        expect(within(screen.getByRole("region", { name: "Hasła" })).queryByRole("status")).toBeNull();
    });
});
