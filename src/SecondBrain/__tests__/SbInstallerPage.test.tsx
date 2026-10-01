import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MainSetup from "../../React/MainSetupReact";
import SbInstallerPage from "../SbInstallerPage";
import { fetchSbAccess, linkOwnGithubAccount, useSbAccess } from "../sbAccessApi";

vi.mock("../../View/Resultsets/CommonComponents", () => ({ SpinnerBootstrap: () => <div role="status">Trwa ładowanie</div> }));
const fetchMock = vi.fn();
const response = (body: unknown, status = 200) => ({ ok: status === 200, status, json: async () => body });
const invited = {
    canManage: false, canSeeSb: true,
    sb: { status: "INVITED", githubState: "PENDING", githubLogin: null, driveState: "READY", isGrantedManually: false },
};
const originalServerUrl = MainSetup.serverUrl;
beforeEach(() => {
    MainSetup.serverUrl = "http://localhost:3000/";
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); MainSetup.serverUrl = originalServerUrl; });

function renderPage(address = "/sbInstaller?githubLogin=osoba-gh") {
    return render(<MemoryRouter initialEntries={[address]}><SbInstallerPage /></MemoryRouter>);
}

describe("Instalator Second Brain", () => {
    it("ukrywa paczkę i instrukcje dla niezaproszonych", async () => {
        fetchMock.mockResolvedValue(response({ canManage: false, canSeeSb: false, sb: null }));
        renderPage();
        expect(await screen.findByText("Nie masz jeszcze dostępu do Second Brain - poproś przełożonego o zaproszenie do SB w PS.")).toBeVisible();
        expect(screen.queryByRole("link")).toBeNull();
        expect(screen.queryByRole("button")).toBeNull();
        expect(screen.queryByText("Zanim uruchomisz instalator")).toBeNull();
    });
    it("wysyła login po kliknięciu i pozwala ponowić po 409", async () => {
        fetchMock.mockResolvedValueOnce(response(invited))
            .mockResolvedValue(response({ errorMessage: "Zaproszenie jeszcze czeka - przyjmij je i spróbuj ponownie." }, 409));
        renderPage();
        expect(await screen.findByRole("button", { name: "Pobierz instalator" })).toBeVisible();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByRole("button", { name: "To moje konto" }));
        expect(await screen.findByText("Zaproszenie jeszcze czeka - przyjmij je i spróbuj ponownie. Gdy to zrobisz, kliknij przycisk jeszcze raz.")).toBeVisible();
        expect(fetchMock).toHaveBeenLastCalledWith("http://localhost:3000/sbAccess/me/githubAccount", {
            method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: '{"githubLogin":"osoba-gh"}',
        });
        expect(screen.getByRole("button", { name: "To moje konto" })).toBeEnabled();
    });
    it.each(["/sbInstaller", "/sbInstaller?githubLogin=%3Cscript%3E"])("nie proponuje powiązania dla %s", async address => {
        fetchMock.mockResolvedValue(response(invited));
        renderPage(address);
        await screen.findByRole("button", { name: "Pobierz instalator" });
        expect(screen.queryByRole("button", { name: "To moje konto" })).toBeNull();
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    it.each([401, 403])("odmowa %s ukrywa instalator", async status => {
        fetchMock.mockResolvedValue(response({}, status));
        renderPage();
        await screen.findByText(/Nie masz jeszcze dostępu/);
        expect(screen.queryByRole("link")).toBeNull();
    });
    it.each(["serwer", "sieć"])("pokazuje błąd dostępu: %s", async failure => {
        if (failure === "serwer") fetchMock.mockResolvedValue(response({}, 500));
        else fetchMock.mockRejectedValue(new Error("Brak sieci"));
        renderPage();
        expect(await screen.findByText("Nie udało się sprawdzić dostępu do Second Brain. Odśwież stronę.")).toBeVisible();
        expect(screen.queryByRole("link")).toBeNull();
    });
    it.each(["OK", "PARTIAL"])("odświeża dostęp po %s i pokazuje wynik", async result => {
        let resolve!: (value: unknown) => void;
        fetchMock.mockResolvedValueOnce(response(invited))
            .mockImplementationOnce(() => new Promise(r => { resolve = r; }))
            .mockResolvedValue(response({ ...invited, sb: { ...invited.sb, status: "ACTIVE", githubState: "LINKED", githubLogin: "osoba-gh" } }));
        renderPage();
        fireEvent.click(await screen.findByRole("button", { name: "To moje konto" }));
        expect(screen.getByRole("button", { name: /To moje konto/ })).toBeDisabled();
        await act(async () => resolve(response({ result, note: "Dysk wymaga sprawdzenia." })));
        expect(await screen.findByText("Gotowe - konto GitHub osoba-gh jest powiązane z Twoim dostępem.")).toBeVisible();
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(!!screen.queryByText("Dysk wymaga sprawdzenia.")).toBe(result === "PARTIAL");
    });
});

describe("API i hook dostępu", () => {
    it("nie rzuca po błędzie sieci", async () => {
        fetchMock.mockRejectedValue(new Error("Brak sieci"));
        expect(await fetchSbAccess()).toBe("error");
        expect(await linkOwnGithubAccount("osoba-gh")).toEqual({ ok: false, status: 0, message: "" });
    });
    it("zachowuje kod odpowiedzi bez JSON", async () => {
        fetchMock.mockResolvedValue({ ok: false, status: 502, json: async () => { throw new Error("Nie JSON"); } });
        expect(await linkOwnGithubAccount("osoba-gh")).toEqual({ ok: false, status: 502, message: "" });
    });
    it("wyłączenie hooka nie pyta serwera i ignoruje spóźnioną odpowiedź", async () => {
        let resolve!: (value: unknown) => void;
        fetchMock.mockImplementation(() => new Promise(r => { resolve = r; }));
        function Access({ enabled }: { enabled: boolean }) {
            const { state } = useSbAccess(enabled);
            return <div>{state}</div>;
        }
        const { rerender, unmount } = render(<Access enabled={false} />);
        expect(screen.getByText("denied")).toBeVisible();
        expect(fetchMock).not.toHaveBeenCalled();
        rerender(<Access enabled />);
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        rerender(<Access enabled={false} />);
        await act(async () => resolve(response(invited)));
        expect(screen.getByText("denied")).toBeVisible();
        rerender(<Access enabled />);
        unmount();
        await act(async () => resolve(response(invited)));
    });
});
