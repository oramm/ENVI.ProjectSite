import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MainSetup from "../../React/MainSetupReact";
import SbInstallerPage from "../SbInstallerPage";
import SbHowItWorks from "../SbHowItWorks";
import { DOORS, EXAMPLES, FLOWS, GUIDE, MAP, SCREENS, SYNC } from "../sbGuideContent";
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
        expect(screen.getAllByText(/Wyodrębnij wszystkie/)).toHaveLength(2);
        expect(screen.getByText("Instalacja krok po kroku")).toBeVisible();
        expect(screen.getByRole("region", { name: "Instalacja krok po kroku" }).querySelectorAll("li")).toHaveLength(12);
        expect(container.querySelector("#po-instalacji")).not.toBeNull();
        expect(screen.getByText("Po instalacji - co dalej")).toBeVisible();
        expect(screen.getAllByText(/Aktualizuj Second Brain/)).toHaveLength(2);
        expect(screen.getByText("Ikony na pulpicie.")).toBeVisible();
        expect(screen.getByText(/Przypnij do paska zadań/)).toBeVisible();
        expect(screen.queryByText(/Uruchom instalator ponownie/)).toBeNull();
    });
    it("zakładka Jak to działa zaczyna od mapy i wraca do Po instalacji", async () => {
        fetchMock.mockResolvedValue(response(invited));
        renderPage("/sbInstaller?widok=jak-to-dziala");
        expect(await screen.findByRole("group", { name: MAP.title })).toBeVisible();
        expect(screen.queryByRole("button", { name: "Pobierz instalator" })).toBeNull();
        expect(screen.queryByText(/Na razie działa tylko u administratora/)).toBeNull();
        expect(screen.queryByText(/Wkrótce/)).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "„Po instalacji - co dalej”" }));
        expect(await screen.findByText("Po instalacji - co dalej")).toBeVisible();
    });
});

describe("Przewodnik Jak to działa", () => {
    const current = () => screen.getByRole("navigation", { name: GUIDE.navLabel }).querySelector("[aria-current=step]")?.textContent;

    it("element mapy prowadzi na swój ekran, a jedno kliknięcie wraca na mapę z zaznaczonym elementem", () => {
        render(<SbHowItWorks onShowPostInstall={() => {}} />);
        expect(current()).toBe("1. Mapa");
        fireEvent.click(screen.getByRole("button", { name: "Kanon (40_wiki)" }));
        expect(screen.getByRole("button", { name: "Kanon (40_wiki)" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByText(MAP.nodes.kanon.text)).toBeVisible();
        fireEvent.click(screen.getByRole("button", { name: /Przejdź do ekranu 2/ }));
        expect(current()).toBe("2. Co masz u siebie");
        expect(screen.getByRole("heading", { name: FLOWS.uSiebie.title })).toHaveFocus();
        fireEvent.click(screen.getByRole("button", { name: "Teczka → kanon" }));
        expect(screen.getByText(FLOWS.uSiebie.steps.kanon.text)).toBeVisible();
        // Pasek prowadzi na ekran, a mapa po powrocie pokazuje element tego ekranu.
        fireEvent.click(screen.getByRole("button", { name: "5. Skille" }));
        fireEvent.click(screen.getByRole("button", { name: "‹ Wróć na mapę" }));
        expect(current()).toBe("1. Mapa");
        expect(screen.getByRole("button", { name: "Skille (sposoby pracy firmy)" })).toHaveAttribute("aria-pressed", "true");
    });

    it("element mapy działa z klawiatury, a drzwi zmieniają kartę przykładu", () => {
        render(<SbHowItWorks onShowPostInstall={() => {}} />);
        fireEvent.keyDown(screen.getByRole("button", { name: "PS (Witryna Projektów)" }), { key: "Enter" });
        expect(screen.getByText(MAP.nodes.ps.text)).toBeVisible();
        fireEvent.click(screen.getByRole("button", { name: "3. Gdzie z czym" }));
        expect(screen.getByRole("article", { name: DOORS.agent.card.says })).toBeVisible();
        fireEvent.click(screen.getByRole("button", { name: "Drzwi: Pomoc" }));
        expect(screen.getByRole("article", { name: DOORS.pomoc.card.says })).toBeVisible();
        expect(screen.queryByRole("article", { name: DOORS.agent.card.says })).toBeNull();
    });

    it("kopiuje zdanie karty jednym kliknięciem i filtruje karty tylko czytające", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
        render(<SbHowItWorks onShowPostInstall={() => {}} />);
        fireEvent.click(screen.getByRole("button", { name: "4. Przykłady" }));
        expect(screen.getAllByRole("article")).toHaveLength(EXAMPLES.length);
        const card = screen.getByRole("article", { name: EXAMPLES[2].says });
        fireEvent.click(within(card).getByRole("button", { name: "Kopiuj" }));
        expect(writeText).toHaveBeenCalledWith(EXAMPLES[2].says);
        expect(await within(card).findByRole("button", { name: "Skopiowano" })).toBeVisible();
        fireEvent.click(screen.getByRole("button", { name: "Tylko czytają" }));
        expect(screen.getAllByRole("article")).toHaveLength(EXAMPLES.filter(e => e.kind === "read").length);
    });

    it("ostatni krok schematu na ekranie 5 nie przenosi się na krótszy schemat ekranu 6", () => {
        render(<SbHowItWorks onShowPostInstall={() => {}} />);
        fireEvent.click(screen.getByRole("button", { name: "5. Skille" }));
        fireEvent.click(screen.getByRole("button", { name: FLOWS.skille.steps.zgloszenie.label }));
        expect(screen.getByText(FLOWS.skille.steps.zgloszenie.text)).toBeVisible();
        fireEvent.click(screen.getByRole("button", { name: "6. Dwie strony" }));
        expect(current()).toBe("6. Dwie strony");
        expect(screen.getByRole("button", { name: FLOWS.dwieStrony.steps.calosc.label })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByText(FLOWS.dwieStrony.steps.calosc.text)).toBeVisible();
    });

    it("tekst przewodnika nie używa słów warsztatowych", () => {
        const text = JSON.stringify([GUIDE.navLabel, MAP, DOORS, EXAMPLES, FLOWS, SCREENS, SYNC]);
        expect(text).not.toMatch(/\b(git|repo|pull|token|MCP|frontmatter|ingest|bootstrap|vault)\b/i);
    });
});

describe("Zanim pobierzesz", () => {
    it("stoi przed przyciskiem i mówi o starych plikach, jednym pobraniu, odblokowaniu i każdym antywirusie", async () => {
        fetchMock.mockImplementation((url: string) => Promise.resolve(String(url).endsWith("sbInstaller/info") ? response({ version: "0.18.1" }) : response(invited)));
        renderPage();
        const button = await screen.findByRole("button", { name: "Pobierz instalator" });
        const section = screen.getByRole("region", { name: "Zanim pobierzesz" });
        expect(section.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        const text = section.textContent ?? "";
        expect(text).toMatch(/Pobrane.*ENVI-SB-instalator/);
        expect(text).toMatch(/unieważnia/);
        expect(text).toMatch(/Właściwości.*Odblokuj.*Wyodrębnij wszystkie/);
        expect(text).toMatch(/każdy antywirus/);
        expect(text).toMatch(/nie tylko Avast/);
        expect(await screen.findByText("ENVI-SB-instalator-0.18.1.zip")).toBeVisible();
    });
    it("bez wersji z PS nie wymyśla nazwy pliku", async () => {
        fetchMock.mockImplementation((url: string) => Promise.resolve(String(url).endsWith("sbInstaller/info") ? response({ version: null }) : response(invited)));
        renderPage();
        await screen.findByRole("region", { name: "Zanim pobierzesz" });
        expect(screen.queryByText(/ENVI-SB-instalator-\d/)).toBeNull();
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
