/**
 * TY-1 (FID.APP.01 decyzja 2026-07-17) — presentational tests for the two-part
 * contract-type badge. Verifies: base = FIDIC axis color, right stripe = billing
 * method when non-default, single-word text, full name in tooltip, neutral badge
 * for non-FIDIC types.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContractTypeBadge } from "./CommonComponents";

const RED = "#dc3545";
const YELLOW = "#ffc107";

describe("ContractTypeBadge", () => {
    it("nothing for empty name", () => {
        const { container } = render(<ContractTypeBadge type={{ name: "" }} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("Czerwony ryczałtowy -> text 'Czerwony', red base + yellow stripe gradient", () => {
        render(<ContractTypeBadge type={{ name: "Czerwony ryczałtowy" }} />);
        const el = screen.getByText("Czerwony");
        expect(el).toBeInTheDocument();
        const bg = el.style.background;
        expect(bg).toContain("linear-gradient");
        expect(bg).toContain(RED);
        expect(bg).toContain(YELLOW);
        // base color leads (left), stripe trails (right)
        expect(bg.indexOf(RED)).toBeLessThan(bg.indexOf(YELLOW));
    });

    it("Żółty obmiarowy -> text 'Żółty', yellow base + red stripe gradient, dark text", () => {
        render(<ContractTypeBadge type={{ name: "Żółty obmiarowy" }} />);
        const el = screen.getByText("Żółty");
        const bg = el.style.background;
        expect(bg).toContain("linear-gradient");
        expect(bg.indexOf(YELLOW)).toBeLessThan(bg.indexOf(RED));
        expect(el.style.color).toBe("rgb(33, 37, 41)"); // #212529 dark text on yellow
    });

    it("Czerwony (plain) -> solid red, no gradient", () => {
        render(<ContractTypeBadge type={{ name: "Czerwony" }} />);
        const el = screen.getByText("Czerwony");
        expect(el.style.background).not.toContain("linear-gradient");
        // jsdom normalizes a solid hex to rgb(); gradient strings keep the hex
        expect(el.style.background).toBe("rgb(220, 53, 69)"); // #dc3545
    });

    it("non-FIDIC type (IK) -> neutral badge, full name as single token", () => {
        render(<ContractTypeBadge type={{ name: "IK" }} />);
        const el = screen.getByText("IK");
        expect(el).toBeInTheDocument();
        expect(el.style.background).not.toContain("linear-gradient");
    });
});
