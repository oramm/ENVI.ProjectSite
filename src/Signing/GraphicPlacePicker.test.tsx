import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GraphicPlacement, GraphicPlaceSearch } from "./SigningApi";
import { GraphicPlacePicker, placementFromClick, placementToOverlay } from "./GraphicPlacePicker";

const SEARCH: GraphicPlaceSearch = {
    pages: [{ width: 600, height: 800, placeable: true }, { width: 400, height: 600, placeable: true }],
    candidates: [],
    stampRel: { width: 0.2, height: 0.1 },
};
const INITIAL: GraphicPlacement = { page: 2, rect: { x: 100, y: 200, width: 80, height: 60 } };
const createUrl = vi.fn();
const revokeUrl = vi.fn();

beforeEach(() => {
    createUrl.mockReset().mockImplementation(() => `blob:page-${createUrl.mock.calls.length}`);
    revokeUrl.mockReset();
    vi.stubGlobal("URL", class extends URL {
        static createObjectURL = createUrl;
        static revokeObjectURL = revokeUrl;
    });
});
afterEach(() => vi.unstubAllGlobals());

function renderPicker(extra: Partial<React.ComponentProps<typeof GraphicPlacePicker>> = {}) {
    const loadPage = vi.fn().mockResolvedValue(new Blob(["png"], { type: "image/png" }));
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const view = render(<GraphicPlacePicker fileName="Oferta.pdf" search={SEARCH} loadPage={loadPage} onConfirm={onConfirm} onCancel={onCancel} {...extra} />);
    return { ...view, loadPage, onConfirm, onCancel };
}

async function clickImage(page = 1, clientX = 160, clientY = 220) {
    const img = await screen.findByAltText(`Strona ${page} dokumentu Oferta.pdf`);
    vi.spyOn(img, "getBoundingClientRect").mockReturnValue({ left: 10, top: 20, width: 300, height: 400 } as DOMRect);
    fireEvent.click(img, { clientX, clientY });
    return img;
}

describe("przeliczenia miejsca grafiki", () => {
    it.each([
        [0, 0, 0, 720],
        [1, 0, 480, 720],
        [0, 1, 0, 0],
        [1, 1, 480, 0],
        [0.5, 0.5, 240, 360],
        [0.01, 0.99, 0, 0],
    ])("klik (%s, %s) daje (%s, %s), przycinając grafikę na stronie", (fx, fy, x, y) => {
        expect(placementFromClick(1, SEARCH.pages[0], SEARCH.stampRel, fx, fy)).toEqual({
            page: 1, rect: { x, y, width: 120, height: 80 },
        });
    });

    it("oś Y PDF rośnie w górę; nakładka wraca do współrzędnych obrazu w procentach", () => {
        const placement = placementFromClick(1, SEARCH.pages[0], SEARCH.stampRel, 0.5, 0.25);
        expect(placement.rect.y).toBe(560);
        expect(placementToOverlay(placement, SEARCH.pages[0])).toEqual({ left: "40%", top: "20%", width: "20%", height: "10%" });
        expect(placementToOverlay(placementFromClick(1, SEARCH.pages[0], SEARCH.stampRel, 1, 0), SEARCH.pages[0]))
            .toEqual({ left: "80%", top: "0%", width: "20%", height: "10%" });
    });
});

describe("GraphicPlacePicker", () => {
    it("pokazuje instrukcję i ładowanie, klik ustawia nakładkę, zatwierdzenie zwraca punkty PDF", async () => {
        const { onConfirm } = renderPicker();
        expect(screen.getByText("Wczytuję stronę 1…")).toBeInTheDocument();
        expect(screen.getByText(/Gotowy PDF zobaczysz jeszcze przed wpisaniem PIN-u/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Zatwierdź miejsce" })).toBeDisabled();
        await clickImage();
        expect(screen.getByLabelText("Tu stanie grafika podpisu")).toHaveStyle({ left: "40%", top: "45%", width: "20%", height: "10%" });
        fireEvent.click(screen.getByRole("button", { name: "Zatwierdź miejsce" }));
        expect(onConfirm).toHaveBeenCalledWith({ page: 1, rect: { x: 240, y: 360, width: 120, height: 80 } });
    });

    it("zmiana strony ładuje nowy obraz, zwalnia stary URL; klik przenosi jedyną grafikę na nową stronę", async () => {
        const { loadPage, onConfirm, unmount } = renderPicker();
        await clickImage();
        expect(screen.getByRole("button", { name: "‹ Poprzednia" })).toBeDisabled();
        fireEvent.click(screen.getByRole("button", { name: "Następna ›" }));
        await screen.findByAltText("Strona 2 dokumentu Oferta.pdf");
        expect(loadPage.mock.calls).toEqual([[1], [2]]);
        expect(revokeUrl).toHaveBeenCalledWith("blob:page-1");
        expect(screen.queryByLabelText("Tu stanie grafika podpisu")).toBeNull();
        expect(screen.getByRole("button", { name: "Następna ›" })).toBeDisabled();
        await clickImage(2);
        fireEvent.click(screen.getByRole("button", { name: "Zatwierdź miejsce" }));
        expect(onConfirm).toHaveBeenCalledWith({ page: 2, rect: { x: 160, y: 270, width: 80, height: 60 } });
        unmount();
        expect(revokeUrl).toHaveBeenCalledWith("blob:page-2");
    });

    it("kolejny klik przenosi prostokąt i przycina go przy brzegu obrazu", async () => {
        const { onConfirm } = renderPicker();
        await clickImage();
        await clickImage(1, 310, 20);
        expect(screen.getAllByLabelText("Tu stanie grafika podpisu")).toHaveLength(1);
        fireEvent.click(screen.getByRole("button", { name: "Zatwierdź miejsce" }));
        expect(onConfirm).toHaveBeenCalledWith({ page: 1, rect: { x: 480, y: 720, width: 120, height: 80 } });
    });

    it("na obróconej stronie pokazuje obraz i wyjaśnienie, ale klik nie wybiera miejsca", async () => {
        renderPicker({ search: { ...SEARCH, pages: [{ ...SEARCH.pages[0], placeable: false }, SEARCH.pages[1]] } });
        await clickImage();
        expect(screen.getByText(/Na tej stronie nie da się ustawić grafiki/)).toBeInTheDocument();
        expect(screen.queryByLabelText("Tu stanie grafika podpisu")).toBeNull();
        expect(screen.getByRole("button", { name: "Zatwierdź miejsce" })).toBeDisabled();
    });

    it("bez myszy: Enter stawia grafikę na środku strony, strzałki ją przesuwają, zatwierdzenie oddaje miejsce", async () => {
        const { onConfirm } = renderPicker();
        await screen.findByAltText("Strona 1 dokumentu Oferta.pdf");
        const area = screen.getByRole("group", { name: /Strona 1: Enter stawia grafikę na środku/ });
        expect(area).toHaveAttribute("tabindex", "0");
        expect(screen.getByRole("button", { name: "Zatwierdź miejsce" })).toBeDisabled();
        fireEvent.keyDown(area, { key: "ArrowRight" }); // bez miejsca strzałka nic nie robi
        expect(screen.getByRole("button", { name: "Zatwierdź miejsce" })).toBeDisabled();
        fireEvent.keyDown(area, { key: "Enter" });
        fireEvent.keyDown(area, { key: "ArrowRight", shiftKey: true }); // +5% szerokości = 30 pt
        fireEvent.keyDown(area, { key: "ArrowDown" }); // +1% wysokości w dół = 8 pt mniej w osi PDF
        fireEvent.click(screen.getByRole("button", { name: "Zatwierdź miejsce" }));
        const placement = onConfirm.mock.calls[0][0] as GraphicPlacement;
        expect(placement.page).toBe(1);
        expect(placement.rect.width).toBeCloseTo(120);
        expect(placement.rect.height).toBeCloseTo(80);
        expect(placement.rect.x).toBeCloseTo(300 - 60 + 30);
        expect(placement.rect.y).toBeCloseTo(400 - 40 - 8);
    });

    it("błąd pobrania mówi co zrobić, a ponowienie wczytuje stronę", async () => {
        const loadPage = vi.fn().mockRejectedValueOnce(new Error("Brak połączenia z PS.")).mockResolvedValueOnce(new Blob(["png"]));
        renderPicker({ loadPage });
        expect(await screen.findByText(/Nie udało się wczytać strony 1: Brak połączenia z PS/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
        await screen.findByAltText("Strona 1 dokumentu Oferta.pdf");
        expect(loadPage.mock.calls).toEqual([[1], [1]]);
    });

    it("initial otwiera właściwą stronę i rysuje istniejące miejsce bez klikania", async () => {
        const { loadPage, onConfirm } = renderPicker({ initial: INITIAL });
        await screen.findByAltText("Strona 2 dokumentu Oferta.pdf");
        expect(loadPage).toHaveBeenCalledWith(2);
        expect(screen.getByLabelText("Tu stanie grafika podpisu")).toHaveStyle({ left: "25%", width: "20%", height: "10%" });
        fireEvent.click(screen.getByRole("button", { name: "Zatwierdź miejsce" }));
        expect(onConfirm).toHaveBeenCalledWith(INITIAL);
    });

    it("dla jednej strony nie pokazuje nawigacji, Anuluj nie zatwierdza zmiany", async () => {
        const { onCancel, onConfirm } = renderPicker({ search: { ...SEARCH, pages: [SEARCH.pages[0]] } });
        await clickImage();
        expect(screen.queryByRole("button", { name: "Następna ›" })).toBeNull();
        expect(screen.queryByText(/Strona 1 z/)).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Anuluj" }));
        expect(onCancel).toHaveBeenCalledOnce();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it("spóźniony obraz poprzedniej strony jest ignorowany", async () => {
        let resolveFirst!: (blob: Blob) => void;
        const loadPage = vi.fn().mockImplementationOnce(() => new Promise<Blob>((resolve) => { resolveFirst = resolve; }))
            .mockResolvedValueOnce(new Blob(["page2"]));
        renderPicker({ loadPage });
        fireEvent.click(screen.getByRole("button", { name: "Następna ›" }));
        await screen.findByAltText("Strona 2 dokumentu Oferta.pdf");
        await act(async () => resolveFirst(new Blob(["page1"])));
        expect(createUrl).toHaveBeenCalledOnce();
        expect(screen.getByAltText("Strona 2 dokumentu Oferta.pdf")).toHaveAttribute("src", "blob:page-1");
    });

    it("nie tworzy URL dla obrazu, który wrócił po odmontowaniu", async () => {
        let resolve!: (blob: Blob) => void;
        const loadPage = vi.fn().mockImplementation(() => new Promise<Blob>((done) => { resolve = done; }));
        const { unmount } = renderPicker({ loadPage });
        unmount();
        await act(async () => resolve(new Blob(["png"])));
        await waitFor(() => expect(createUrl).not.toHaveBeenCalled());
    });
});
