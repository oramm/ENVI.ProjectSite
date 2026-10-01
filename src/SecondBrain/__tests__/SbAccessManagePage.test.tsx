import React from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MainSetup from "../../React/MainSetupReact";
import SbAccessManagePage from "../SbAccessManagePage";
import { fetchSbEntries, performSbAction, SbEntry } from "../sbManageApi";

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
        await screen.findByText("Zaproszony");
        expect(screen.getByText("Aktywny")).toBeVisible();
        expect(screen.getByText("Zablokowany")).toBeVisible();
        expect(screen.getByText("Odebrany")).toBeVisible();
        fireEvent.click(screen.getAllByRole("button", { name: "Zablokuj" })[0]);
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
        renderPage(); fireEvent.click(await screen.findByRole("button", { name: "Odblokuj" }));
        const alert = await screen.findByRole("alert");
        expect(alert).toHaveClass("alert-warning"); expect(alert).toHaveTextContent("Dysk pozostał.");
    });
    it("503 operacji zostaje w potwierdzeniu i pozwala ponowić", async () => {
        operationStatus = 503; operationBody = { errorMessage: "Brak tokenu" };
        renderPage(); fireEvent.click(await screen.findByRole("button", { name: "Zablokuj" }));
        fireEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Zablokuj" }));
        expect(await screen.findByText(/Funkcja nieskonfigurowana/)).toBeVisible();
        expect(within(screen.getByRole("dialog")).getByRole("button", { name: "Zablokuj" })).toBeEnabled();
    });
    it("ręczne nadania mają wyjaśnienie i historię bez zmiany stanu", async () => {
        rows = [row(1, { isGrantedManually: true })]; renderPage();
        await screen.findByText(/Nadane ręcznie przed uruchomieniem/);
        expect(screen.queryByRole("button", { name: "Zablokuj" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Odbierz" })).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Historia" }));
        expect(await screen.findByText("Brak zdarzeń.")).toBeVisible();
    });
    it("503 członków GitHuba nie zasłania rejestru", async () => {
        membersStatus = 503; renderPage();
        await screen.findByText("Funkcja nieskonfigurowana - nie można pobrać listy członków GitHub.");
        expect(screen.getByText("Nowak1 Anna")).toBeVisible();
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
