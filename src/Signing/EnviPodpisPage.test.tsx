import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    programInfo: vi.fn(),
    programDownloadUrl: () => "http://srv/signing/program/download",
}));
vi.mock("./SigningApi", () => ({ SigningApi: api }));

import EnviPodpisPage from "./EnviPodpisPage";

/** Przycisk to kotwica z href (react-bootstrap nadaje jej rolę przycisku, więc szukamy po tekście). */
const downloadLink = () => screen.getByText("Pobierz ENVI Podpis").closest("a");

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe("Strona ENVI Podpis", () => {
    it("pokazuje wersję z PS i odnośnik do pobrania", async () => {
        api.programInfo.mockResolvedValue({ available: true, version: "2.3.0" });
        render(<EnviPodpisPage />);
        expect(await screen.findByText("Wersja dostępna w PS: 2.3.0")).toBeVisible();
        expect(downloadLink()).toHaveAttribute("href", "http://srv/signing/program/download");
    });
    it("gdy program niedostępny, ukrywa przycisk i pokazuje komunikat", async () => {
        api.programInfo.mockResolvedValue({ available: false, version: null });
        render(<EnviPodpisPage />);
        expect(await screen.findByText("Program nie jest teraz dostępny do pobrania. Zgłoś to administratorowi.")).toBeVisible();
        expect(screen.queryByRole("link", { name: /Pobierz ENVI Podpis/ })).toBeNull();
    });
    it("przy błędzie zapytania pokazuje neutralną linijkę, a przycisk zostaje", async () => {
        api.programInfo.mockRejectedValue(new Error("Brak sieci"));
        render(<EnviPodpisPage />);
        expect(await screen.findByText("Nie udało się sprawdzić wersji programu.")).toBeVisible();
        expect(downloadLink()).toBeVisible();
    });
});
