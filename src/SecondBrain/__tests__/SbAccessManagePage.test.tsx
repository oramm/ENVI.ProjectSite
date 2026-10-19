import React from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MainSetup from "../../React/MainSetupReact";
import SbAccessManagePage from "../SbAccessManagePage";
import { fetchSbEntries, performSbAction, SbEntry } from "../sbManageApi";

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
    MainSetup.serverUrl = "http://localhost:3000/";
    rows = [row()]; manage = true; operationStatus = 200; operationBody = { result: "OK", note: "" }; membersStatus = 200;
    fetchMock.mockReset().mockImplementation(async (url: string, init?: RequestInit) => {
        if (init?.method) return response(operationBody, operationStatus);
        if (url.endsWith("/access")) return response({ canManage: manage, canSeeSb: false, sb: null });
        if (url.endsWith("/entries")) return response(rows);
        if (url.endsWith("/candidates")) return response([{ personId: 9, name: "Jan", surname: "Lis", systemEmail: "jan@example.com", systemRoleName: "ENVI_EMPLOYEE", statusCode: null }]);
        if (url.endsWith("/unlinked")) return response([{ login: "anna-gh", profileUrl: "https://github.com/anna-gh" }], membersStatus);
        if (url.endsWith("/events")) return response([]);
        throw new Error(`Nieoczekiwana trasa: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); MainSetup.serverUrl = originalUrl; });
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
        rows = [row(1, { canManageSb: true, levels: { repos: "read", psDb: "none", drive: "connector", mail: ["faktury"] } }), row(2)]; renderPage();
        await screen.findByText(/Administratorzy SB · 1/); expect(screen.getByText(/Pracownicy · 1/)).toBeVisible();
        expect(screen.getByText("odczyt")).toBeVisible(); expect(screen.getByText("faktury")).toBeVisible(); expect(screen.getByText("konektor")).toBeVisible();
        expect(screen.getByText("Hasła")).toBeVisible(); expect(screen.queryByText("Komputer")).toBeNull();
        await pick();
        const panel = screen.getByLabelText("Panel osoby");
        fireEvent.change(within(panel).getByLabelText("Repozytoria"), { target: { value: "write" } });
        fireEvent.change(within(panel).getByLabelText("Baza PS"), { target: { value: "ro" } });
        fireEvent.click(within(panel).getByLabelText("Skrzynka marek"));
        fireEvent.click(within(panel).getByLabelText("Skrzynka faktury"));
        fireEvent.click(within(panel).getByRole("button", { name: "Zapisz uprawnienia" }));
        await screen.findByText(/Zapisano uprawnienia/);
        expect(mutations()[0]).toEqual(["http://localhost:3000/sbAccess/1/levels", {
            method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
            body: '{"repos":"write","psDb":"ro","drive":"connector","mail":["marek"]}',
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
        fireEvent.click(within(dialog).getByRole("button", { name: /Zaszyfruj i udostępnij/ }));
        await screen.findByText(/Udostępniono hasło \(baza PS\)/);
        expect(encryptMock).toHaveBeenCalledWith(jwk, "Tajne-Haslo-1");
        expect(mutations()[0]).toEqual(["http://localhost:3000/sbAccess/1/secrets/baza-ps", {
            method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ciphertext: "SZYFR+base64==", keyThumbprint: "a".repeat(64) }),
        }]);
        expect(JSON.stringify(fetchMock.mock.calls)).not.toContain("Tajne-Haslo-1");
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
        fireEvent.click(within(dialog).getByRole("button", { name: /Zaszyfruj i udostępnij/ }));
        expect(await within(dialog).findByText("Klucz komputera pracownika zmienił się.")).toBeVisible();
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
