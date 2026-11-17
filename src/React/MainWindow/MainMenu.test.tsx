import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MainSetup from "../MainSetupReact";
import MainMenu from "./MainMenu";

const fetchMock = vi.fn();
const observeMenu = vi.fn();
const disconnectMenu = vi.fn();
let resizeMenu: () => void;
const json = (body: unknown) => ({ ok: true, status: 200, json: async () => body });
const SB_ACCESS = { status: "ACTIVE", githubState: "LINKED", githubLogin: "osoba", driveState: "READY", isGrantedManually: false };

/** Serwer odpowiada na flagi modułów i dostęp do Second Brain; reszta to odmowa. */
function serve({ mileage = false, sbGranted = false, canManage = false, pomoc = false }) {
    fetchMock.mockImplementation(async (url: string) => {
        const path = String(url);
        if (path.endsWith("pomoc/available")) return json({ available: pomoc, version: "test" });
        if (path.endsWith("mileage/access")) return json({ hasAccess: mileage });
        if (path.endsWith("sbAccess/access")) {
            return json(sbGranted ? { canManage, canSeeSb: true, sb: SB_ACCESS } : { canManage: false, canSeeSb: false, sb: null });
        }
        return json({ hasAccess: false });
    });
}

function signIn(systemRoleName: string) {
    sessionStorage.setItem("Current User", JSON.stringify({
        googleId: "g", picture: "", systemEmail: "a@envi.com.pl", systemRoleId: 1, systemRoleName, userName: "Anna Testowa",
    }));
}

function renderMenu() {
    return render(<MemoryRouter><MainMenu /></MemoryRouter>);
}

const originalServerUrl = MainSetup.serverUrl;
beforeEach(() => {
    MainSetup.serverUrl = "http://localhost:3000/";
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("ResizeObserver", class {
        constructor(callback: () => void) { resizeMenu = callback; }
        observe = observeMenu;
        disconnect = disconnectMenu;
    });
    observeMenu.mockClear();
    disconnectMenu.mockClear();
});
afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    sessionStorage.clear();
    MainSetup.serverUrl = originalServerUrl;
});

it("Pomoc zaczyna się pod paskiem także po zmianie jego wysokości i sprząta pomiar", () => {
    signIn("ENVI_EMPLOYEE");
    serve({});
    const height = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(56);
    const { unmount } = renderMenu();
    expect(observeMenu).toHaveBeenCalledWith(screen.getByRole("navigation"));
    expect(document.body.style.getPropertyValue("--envi-pomoc-top")).toBe("56px");
    height.mockReturnValue(240);
    resizeMenu();
    expect(document.body.style.getPropertyValue("--envi-pomoc-top")).toBe("240px");
    unmount();
    expect(disconnectMenu).toHaveBeenCalledTimes(1);
    expect(document.body.style.getPropertyValue("--envi-pomoc-top")).toBe("");
    height.mockRestore();
});

it("Pomoc jest obok użytkownika i działa po rozwinięciu hamburgera", async () => {
    signIn("ENVI_EMPLOYEE");
    serve({ pomoc: true });
    renderMenu();
    const help = await screen.findByRole("button", { name: "Pomoc" });
    const userMenu = screen.getByRole("button", { name: "Anna Testowa" });
    expect(help.parentElement).toBe(userMenu.parentElement?.parentElement);
    expect(help).toHaveAttribute("aria-pressed", "false");
    const toggle = screen.getByRole("button", { name: "Toggle navigation" });
    const collapse = document.getElementById(toggle.getAttribute("aria-controls")!)!;
    expect(collapse).toContainElement(help);
    fireEvent.click(toggle);
    await waitFor(() => expect(collapse).toHaveClass("show"));
    fireEvent.click(help);
    expect(help).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("textbox")).toHaveFocus();
    fireEvent.click(userMenu);
    expect(await screen.findByText("Wyloguj się")).toBeVisible();
});

describe("Menu - Biuro, Kontakty i Narzędzia", () => {
    it("administrator: Administracja w Biurze, Hierarchia typów raz, bez Panelu administracyjnego", async () => {
        signIn("ADMIN");
        serve({ canManage: true, sbGranted: true });
        renderMenu();
        fireEvent.click(screen.getByText("Biuro"));
        expect(await screen.findByText("Dostęp do Second Brain")).toBeVisible();
        expect(screen.getByText("Administracja")).toBeVisible();
        expect(screen.getByText("Personel i uprawnienia")).toBeVisible();
        expect(screen.getByText("Typy nieobecności")).toBeVisible();
        expect(screen.getAllByText("Hierarchia typów")).toHaveLength(1);
        expect(screen.getAllByText("Słowniki")).toHaveLength(1);

        fireEvent.click(screen.getByText("Kontakty"));
        expect(await screen.findByText("Podmioty w GUS")).toBeVisible();

        fireEvent.click(screen.getByText("Anna Testowa"));
        expect(screen.queryByText("Panel administracyjny")).toBeNull();
        expect(screen.getAllByText("Hierarchia typów")).toHaveLength(1);
        expect(screen.getByRole("link", { name: "ENVI Podpis" })).toHaveAttribute("href", "/enviPodpis");
        expect(screen.getByRole("link", { name: "Second Brain" })).toHaveAttribute("href", "/sbInstaller");
    });

    it("zwykły pracownik ENVI: Słowniki tak, Administracja i Typy nieobecności nie", async () => {
        signIn("ENVI_EMPLOYEE");
        serve({ mileage: true });
        renderMenu();
        fireEvent.click(screen.getByText("Biuro"));
        expect(await screen.findByText("Hierarchia typów")).toBeVisible();
        expect(screen.getByText("Słowniki")).toBeVisible();
        expect(screen.queryByText("Administracja")).toBeNull();
        expect(screen.queryByText("Personel i uprawnienia")).toBeNull();
        expect(screen.queryByText("Typy nieobecności")).toBeNull();
        expect(screen.queryByText("Samochody")).toBeNull();
    });

    it("Narzędzia: ENVI Podpis dla pracowników, Second Brain tylko z dostępem", async () => {
        signIn("ENVI_EMPLOYEE");
        serve({ sbGranted: false });
        renderMenu();
        fireEvent.click(screen.getByText("Anna Testowa"));
        expect(await screen.findByText("Narzędzia")).toBeVisible();
        expect(screen.getByRole("link", { name: "ENVI Podpis" })).toBeVisible();
        expect(screen.queryByRole("link", { name: "Second Brain" })).toBeNull();
    });

    it("rola zakresowa: bez Narzędzi i bez Biura, Podmioty jako zwykły link", async () => {
        signIn("CLIENT");
        serve({});
        renderMenu();
        expect(screen.getByRole("link", { name: "Podmioty" })).toHaveAttribute("href", "/entities");
        expect(screen.queryByText("Kontakty")).toBeNull();
        expect(screen.queryByText("Biuro")).toBeNull();
        fireEvent.click(screen.getByText("Anna Testowa"));
        expect(await screen.findByText("Wyloguj się")).toBeVisible();
        expect(screen.queryByText("Narzędzia")).toBeNull();
        expect(screen.queryByRole("link", { name: "ENVI Podpis" })).toBeNull();
    });
});
