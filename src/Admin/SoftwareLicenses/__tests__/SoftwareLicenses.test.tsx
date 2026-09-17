import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SoftwareLicenseKey } from "../SoftwareLicenseKey";
import { LicenseForm } from "../Modals/SoftwareLicenseModalButtons";
import { makeSoftwareLicenseValidationSchema } from "../Modals/SoftwareLicenseValidationSchema";
import { softwareLicensesRepository as repo } from "../SoftwareLicensesController";
import { SoftwareLicenseData } from "../SoftwareLicenseTypes";
import { SoftwareLicenseGoogleDriveAction } from "../SoftwareLicensesSearch";
import MainSetup from "../../../React/MainSetupReact";

vi.mock("../../../React/Tools/ToolsFetch", () => ({ default: { notifySessionExpired: vi.fn() } }));
const item = { id: 13, manufacturer: "Test", product: "Program", googleDriveUrl: null, seatsPurchased: 2, seatsUsed: 1, seatsFree: 1, hasLicenseKey: true } as SoftwareLicenseData;
const fetchMock = vi.fn();
const response = (body: unknown, ok = true) => ({ ok, status: ok ? 200 : 500, json: async () => body });
beforeEach(() => {
    sessionStorage.clear(); sessionStorage.setItem("Current User", JSON.stringify({ systemRoleName: "ADMIN", userName: "Test" }));
    MainSetup.serverUrl = "http://localhost:3000/";
    vi.stubGlobal("fetch", fetchMock); fetchMock.mockReset(); repo.items = []; repo.currentItems = [];
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("license secret boundaries", () => {
    it("shows a Google Drive action only when the link is present", () => {
        const { rerender } = render(<SoftwareLicenseGoogleDriveAction dataObject={item} layout="vertical" />);
        expect(screen.queryByRole("link", { name: "Dysk Google" })).toBeNull();
        rerender(<SoftwareLicenseGoogleDriveAction dataObject={{ ...item, googleDriveUrl: "https://drive.google.com/drive/folders/abc" }} layout="vertical" />);
        expect(screen.getByRole("link", { name: "Dysk Google" })).toHaveAttribute("href", "https://drive.google.com/drive/folders/abc");
        expect(screen.getByRole("link", { name: "Dysk Google" })).toHaveAttribute("target", "_blank");
    });
    it("one click produces one request under StrictMode", async () => {
        fetchMock.mockResolvedValue(response({ licenseKey: "temporary" }));
        render(<React.StrictMode><SoftwareLicenseKey license={item} /></React.StrictMode>);
        fireEvent.click(screen.getByRole("button", { name: "Pokaż klucz" }));
        await screen.findByRole("textbox", { name: "Klucz licencyjny" });
        expect(fetchMock).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByRole("button", { name: "Ukryj" }));
        fireEvent.click(screen.getByRole("button", { name: "Pokaż klucz" }));
        await screen.findByRole("textbox", { name: "Klucz licencyjny" });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    it("does not fetch a key before explicit action and never offers reveal to manager", () => {
        sessionStorage.setItem("Current User", JSON.stringify({ systemRoleName: "ENVI_MANAGER", userName: "Test" }));
        render(<SoftwareLicenseKey license={item} />);
        expect(screen.queryByRole("button", { name: "Pokaż klucz" })).toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
    });
    it.each(["123", "null", "  dokładny\nklucz 😀  "])("reveals exact string then discards on close (%#)", async key => {
        fetchMock.mockResolvedValue(response({ licenseKey: key }));
        render(<SoftwareLicenseKey license={item} />);
        expect(fetchMock).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole("button", { name: "Pokaż klucz" }));
        expect(await screen.findByRole("textbox", { name: "Klucz licencyjny" })).toHaveValue(key);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "POST", cache: "no-store", credentials: "include" });
        expect(JSON.stringify(sessionStorage)).not.toContain("licenseKey");
        fireEvent.click(screen.getByRole("button", { name: "Ukryj" }));
        await waitFor(() => expect(screen.queryByRole("textbox", { name: "Klucz licencyjny" })).toBeNull());
    });
    it("ignores a late response after close", async () => {
        let resolve!: (value: unknown) => void;
        fetchMock.mockReturnValue(new Promise(r => { resolve = r; }));
        render(<SoftwareLicenseKey license={item} />);
        fireEvent.click(screen.getByRole("button", { name: "Pokaż klucz" }));
        fireEvent.click(screen.getByRole("button", { name: "Ukryj" }));
        await act(async () => resolve(response({ licenseKey: "late-secret" })));
        expect(screen.queryByRole("textbox", { name: "Klucz licencyjny" })).toBeNull();
        expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    });
    it.each(["blur", "pagehide"])("hides on %s", async event => {
        fetchMock.mockResolvedValue(response({ licenseKey: "temporary" }));
        render(<SoftwareLicenseKey license={item} />);
        fireEvent.click(screen.getByRole("button", { name: "Pokaż klucz" }));
        await screen.findByRole("textbox", { name: "Klucz licencyjny" });
        fireEvent(window, new Event(event));
        expect(screen.queryByRole("textbox", { name: "Klucz licencyjny" })).toBeNull();
    });
    it("expires after 30 seconds", async () => {
        vi.useFakeTimers(); fetchMock.mockResolvedValue(response({ licenseKey: "temporary" }));
        render(<SoftwareLicenseKey license={item} />);
        await act(async () => fireEvent.click(screen.getByRole("button", { name: "Pokaż klucz" })));
        expect(screen.getByRole("textbox", { name: "Klucz licencyjny" })).toHaveValue("temporary");
        act(() => vi.advanceTimersByTime(30000));
        expect(screen.queryByRole("textbox", { name: "Klucz licencyjny" })).toBeNull();
    });
    it("does not echo server/transport diagnostics or retry reveal", async () => {
        fetchMock.mockRejectedValue(new Error("secret-from-transport"));
        render(<SoftwareLicenseKey license={item} />);
        fireEvent.click(screen.getByRole("button", { name: "Pokaż klucz" }));
        expect(await screen.findByRole("alert")).not.toHaveTextContent("secret-from-transport");
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    it("allowlists response fields before list, save, current item and snapshot", async () => {
        fetchMock.mockResolvedValue(response({ ...item, licenseKey: "private", encryptedLicenseKey: "cipher" }));
        await repo.saveLicense({ licenseKey: "private" });
        expect(JSON.stringify(repo)).not.toMatch(/private|cipher|licenseKey|encryptedLicenseKey/);
        expect(sessionStorage.getItem("softwareLicenses")).not.toMatch(/private|cipher|licenseKey|encryptedLicenseKey/);
        fetchMock.mockResolvedValue(response([{ ...item, licenseKey: "private" }]));
        await repo.loadItemsFromServerPOST([]);
        expect(JSON.stringify(repo)).not.toContain("private");
    });
    it("form saves JSON-looking key exactly; callbacks and cache receive only public response", async () => {
        fetchMock.mockResolvedValue(response(item)); const onSave = vi.fn(), onClose = vi.fn();
        render(<LicenseForm onSave={onSave} onClose={onClose} />);
        fireEvent.change(screen.getByLabelText("Producent"), { target: { value: "Test" } });
        fireEvent.change(screen.getByLabelText("Produkt"), { target: { value: "Program" } });
        fireEvent.change(screen.getByLabelText("Zmiana klucza"), { target: { value: "replace" } });
        fireEvent.change(screen.getByLabelText("Nowy klucz"), { target: { value: "null" } });
        fireEvent.click(screen.getByRole("button", { name: "Zapisz" }));
        await waitFor(() => expect(onClose).toHaveBeenCalled());
        expect(JSON.parse(fetchMock.mock.calls[0][1].body).licenseKey).toBe("null");
        expect(onSave).toHaveBeenCalledWith(expect.not.objectContaining({ licenseKey: expect.anything() }));
        expect(screen.getByLabelText("Nowy klucz")).toHaveValue("");
    });
    it.each(["keep", "remove"])("editing uses explicit %s key semantics", async action => {
        fetchMock.mockResolvedValue(response(item)); const onClose = vi.fn();
        render(<LicenseForm initialData={item} onClose={onClose} />);
        if (action === "remove") fireEvent.change(screen.getByLabelText("Zmiana klucza"), { target: { value: action } });
        fireEvent.click(screen.getByRole("button", { name: "Zapisz" }));
        await waitFor(() => expect(onClose).toHaveBeenCalled());
        const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
        if (action === "keep") expect(payload).not.toHaveProperty("licenseKey");
        else expect(payload.licenseKey).toBeNull();
    });
});

describe("license validation", () => {
    const base = { manufacturer: "Test", product: "Program", seatsPurchased: "2", seatsUsed: "1", keyAction: "keep" };
    it.each([
        { seatsUsed: "3" }, { seatsPurchased: "-1" }, { seatsUsed: "0.1" }, { seatsPurchased: "2147483648" },
        { cost: "1.123" }, { cost: "-1" }, { cost: "10000000000" }, { expirationDate: "2026-02-30" },
        { purchaseDate: "0999-01-01" }, { manufacturer: " " }, { version: "x".repeat(101) },
        { comment: "ą".repeat(32768) }, { keyAction: "replace", licenseKey: "" },
        { googleDriveUrl: "http://drive.google.com/drive/folders/abc" }, { googleDriveUrl: "https://example.com/file" },
    ])("rejects invalid payload %j", async invalid => {
        await expect(makeSoftwareLicenseValidationSchema().validate({ ...base, ...invalid })).rejects.toThrow();
    });
    it("keeps key bytes and accepts Polish decimal input", async () => {
        const result = await makeSoftwareLicenseValidationSchema().validate({ ...base, keyAction: "replace", licenseKey: "  null\n😀 ", cost: "12,30" });
        expect(result.licenseKey).toBe("  null\n😀 "); expect(result.cost).toBe("12.30");
    });
    it("accepts Google Drive and Docs links", async () => {
        for (const googleDriveUrl of ["https://drive.google.com/drive/folders/abc", "https://docs.google.com/document/d/abc/edit"])
            expect((await makeSoftwareLicenseValidationSchema().validate({ ...base, googleDriveUrl })).googleDriveUrl).toBe(googleDriveUrl);
    });
});
