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

/** Wywołania dostępu (bez wersji paczki) - wersja to osobne, dodatkowe pytanie strony po przyznaniu dostępu. */
const accessCalls = () => fetchMock.mock.calls.filter(([url]) => !String(url).endsWith("sbInstaller/info")).length;

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
        expect(screen.queryByText("Instalacja krok po kroku")).toBeNull();
        expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith("sbInstaller/info"))).toBe(false);
    });
    it("wysyła login po kliknięciu i pozwala ponowić po 409", async () => {
        fetchMock.mockResolvedValueOnce(response(invited))
            .mockResolvedValue(response({ errorMessage: "Zaproszenie jeszcze czeka - przyjmij je i spróbuj ponownie." }, 409));
        renderPage();
        expect(await screen.findByRole("button", { name: "Pobierz instalator" })).toBeVisible();
        expect(accessCalls()).toBe(1);
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
        expect(accessCalls()).toBe(1);
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
        const active = { ...invited, sb: { ...invited.sb, status: "ACTIVE", githubState: "LINKED", githubLogin: "osoba-gh" } };
        let accessAnswers = 0;
        // Odpowiedź zależy od adresu, bo wersja paczki może przyjść w dowolnej kolejności.
        fetchMock.mockImplementation((url: string) => {
            if (String(url).endsWith("sbInstaller/info")) return Promise.resolve(response({ version: null }));
            if (String(url).endsWith("/githubAccount")) return new Promise(r => { resolve = r; });
            accessAnswers += 1;
            return Promise.resolve(response(accessAnswers === 1 ? invited : active));
        });
        renderPage();
        fireEvent.click(await screen.findByRole("button", { name: "To moje konto" }));
        expect(screen.getByRole("button", { name: /To moje konto/ })).toBeDisabled();
        await act(async () => resolve(response({ result, note: "Dysk wymaga sprawdzenia." })));
        expect(await screen.findByText("Gotowe - konto GitHub osoba-gh jest powiązane z Twoim dostępem.")).toBeVisible();
        // dostęp, wersja paczki, zapis konta, ponowne sprawdzenie dostępu i ponowna wersja
        // (po odświeżeniu dostęp wraca przez stan "loading", a wersja pyta od nowa)
        expect(fetchMock).toHaveBeenCalledTimes(5);
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

describe("Treść instalatora", () => {
    it("każe wyodrębnić ZIP i zawiera sekcję Po instalacji z kotwicą", async () => {
        fetchMock.mockResolvedValue(response(invited));
        const { container } = renderPage("/sbInstaller?sekcja=po-instalacji");
        await screen.findByRole("button", { name: "Pobierz instalator" });
        expect(screen.queryByText(/Nie musisz go rozpakowywać/)).toBeNull();
        expect(screen.getByText(/Wyodrębnij wszystkie/)).toBeVisible();
        expect(screen.getByText("Instalacja krok po kroku")).toBeVisible();
        expect(screen.getByRole("region", { name: "Instalacja krok po kroku" }).querySelectorAll("li")).toHaveLength(12);
        expect(container.querySelector("#po-instalacji")).not.toBeNull();
        expect(screen.getByText("Po instalacji - co dalej")).toBeVisible();
        expect(screen.getAllByText(/Aktualizuj Second Brain/)).toHaveLength(2);
        expect(screen.getByText("Ikony na pulpicie.")).toBeVisible();
        expect(screen.getByText(/Przypnij do paska zadań/)).toBeVisible();
        expect(screen.queryByText(/Uruchom instalator ponownie/)).toBeNull();
    });
    it("zakładka Jak to działa prowadzi krokami po schemacie i wraca do Po instalacji", async () => {
        fetchMock.mockResolvedValue(response(invited));
        renderPage("/sbInstaller?widok=jak-to-dziala");
        expect(await screen.findByRole("img", { name: "Jedna wiedza, wiele komputerów" })).toBeVisible();
        expect(screen.queryByRole("button", { name: "Pobierz instalator" })).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Kopia u Ciebie" }));
        expect(screen.getByRole("button", { name: "Kopia u Ciebie" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByText(/Odświeża się sama co 4 godziny/)).toBeVisible();
        expect(screen.getByText(/Na razie działa tylko u administratora/)).toBeVisible();
        expect(screen.getAllByText("jeszcze nie działa")).toHaveLength(2);
        expect(screen.getByText("Zgoda człowieka")).toBeVisible();
        fireEvent.click(screen.getByRole("button", { name: "„Po instalacji - co dalej”" }));
        expect(await screen.findByText("Po instalacji - co dalej")).toBeVisible();
    });
});

describe("Wersja paczki", () => {
    it("pokazuje wersję z PS obok przycisku pobrania", async () => {
        fetchMock.mockImplementation((url: string) => Promise.resolve(String(url).endsWith("sbInstaller/info") ? response({ version: "1.4.2" }) : response(invited)));
        renderPage();
        expect(await screen.findByText("Wersja dostępna w PS: 1.4.2")).toBeVisible();
        expect(screen.getByRole("button", { name: "Pobierz instalator" })).toBeVisible();
    });
    it.each([
        ["brak wersji", () => Promise.resolve(response({ version: null }))],
        ["błąd sieci", () => Promise.reject(new Error("Brak sieci"))],
    ])("nic nie pokazuje przy: %s", async (_name, info) => {
        fetchMock.mockImplementation((url: string) => (String(url).endsWith("sbInstaller/info") ? info() : Promise.resolve(response(invited))));
        renderPage();
        await screen.findByRole("button", { name: "Pobierz instalator" });
        expect(screen.queryByText(/Wersja dostępna w PS/)).toBeNull();
    });
});
