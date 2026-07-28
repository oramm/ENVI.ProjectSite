/**
 * TY-1b (FID.APP.01 decyzja 2026-07-28) — presentational tests for the contract-type
 * badge with a fade-out accent anchored to the RIGHT edge. Verifies: base = FIDIC axis
 * color, accent = billing method when non-default, single-word visible text, screen-reader
 * text for the accent, plain badge untouched, neutral badge for non-FIDIC types.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContractTypeBadge } from "./CommonComponents";

const RED = "rgb(220, 53, 69)"; // #dc3545 — jsdom normalizes backgroundColor to rgb()
const YELLOW = "rgb(255, 193, 7)"; // #ffc107

function renderBadge(name: string) {
    const { container } = render(<ContractTypeBadge type={{ name }} />);
    return container.querySelector(".badge") as HTMLElement;
}

describe("ContractTypeBadge", () => {
    it("nothing for empty name", () => {
        const { container } = render(<ContractTypeBadge type={{ name: "" }} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("Czerwony ryczałtowy -> red base + yellow accent faded from the right edge", () => {
        const el = renderBadge("Czerwony ryczałtowy");
        expect(el.firstChild).toHaveTextContent("Czerwony"); // widoczne JEDNO słowo
        expect(el.style.backgroundColor).toBe(RED);
        // kotwiczenie od prawej krawędzi + sparowane .45em/1.45em/1.6em (kontrast AA)
        expect(el.style.backgroundImage).toBe("linear-gradient(to left, #ffc107 0 .45em, transparent 1.45em)");
        expect(el.style.paddingRight).toBe("1.6em");
        expect(el.querySelector(".visually-hidden")).toHaveTextContent("rozliczany ryczałtem");
    });

    it("Żółty obmiarowy -> yellow base + red accent, dark text", () => {
        const el = renderBadge("Żółty obmiarowy");
        expect(el.style.backgroundColor).toBe(YELLOW);
        expect(el.style.backgroundImage).toBe("linear-gradient(to left, #dc3545 0 .45em, transparent 1.45em)");
        expect(el.style.color).toBe("rgb(33, 37, 41)"); // #212529 dark text on yellow
        expect(el.querySelector(".visually-hidden")).toHaveTextContent("rozliczany obmiarem");
    });

    it("Czerwony (plain) -> solid red, no accent and no extra padding", () => {
        const el = renderBadge("Czerwony");
        expect(el).toHaveTextContent("Czerwony");
        expect(el.style.backgroundColor).toBe(RED);
        // regresja z przeglądu wizualnego 2026-07-28: `bg-primary` ma !important i przebijał bazę
        expect(el.className).not.toContain("bg-primary");
        expect(el.style.backgroundImage).toBe("");
        expect(el.style.paddingRight).toBe("");
        expect(el.querySelector(".visually-hidden")).toBeNull();
    });

    it("non-FIDIC type (IK) -> neutral badge, never accented", () => {
        const el = renderBadge("IK");
        expect(screen.getByText("IK")).toBeInTheDocument();
        expect(el.style.backgroundImage).toBe("");
        expect(el.querySelector(".visually-hidden")).toBeNull();
    });
});
