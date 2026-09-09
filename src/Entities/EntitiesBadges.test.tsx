/**
 * GUS-4b — mapowanie stanu porównania na plakietkę.
 *
 * Dwie rzeczy, które ten test pilnuje, bo obie są decyzją właściciela, a nie
 * preferencją programisty:
 *  1. brzmienie etykiet („różni się", „inny zapis", „wykreślony z rejestru",
 *     „nieznany w rejestrze", „nie sprawdzano", „zgodny", „błąd"),
 *  2. że kolorem zapala się WYŁĄCZNIE `DIFF`, a `DIFF_MINOR` zostaje szary i cichy.
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GusStatus, GusStatusBadge } from "./EntitiesBadges";

function badgeFor(status: GusStatus): HTMLElement {
    const { container } = render(<GusStatusBadge status={status} />);
    return container.querySelector(".badge") as HTMLElement;
}

describe("GusStatusBadge", () => {
    it.each([
        ["DIFF", "różni się"],
        ["DIFF_MINOR", "inny zapis"],
        ["OK", "zgodny"],
        ["CLOSED", "wykreślony z rejestru"],
        ["NOT_FOUND", "nieznany w rejestrze"],
        ["ERROR", "błąd"],
        ["NOT_CHECKED", "nie sprawdzano"],
    ] as [GusStatus, string][])("stan %s ma etykietę zatwierdzoną przez właściciela: %s", (status, label) => {
        expect(badgeFor(status).textContent).toContain(`GUS: ${label}`);
    });

    it("kolorem zapala się tylko DIFF; inny zapis jest szary i cichy", () => {
        expect(badgeFor("DIFF").className).toContain("bg-warning");

        const minor = badgeFor("DIFF_MINOR");
        expect(minor.className).toContain("bg-secondary");
        expect(minor.className).not.toContain("bg-warning");
        expect(minor.className).not.toContain("bg-danger");
    });

    it("brak stanu czyta się jako „nie sprawdzano”, a nie jako pustkę", () => {
        const { container } = render(<GusStatusBadge status={undefined} />);
        expect((container.querySelector(".badge") as HTMLElement).textContent).toContain("nie sprawdzano");
    });

    it("data sprawdzenia wchodzi do dymka, w zapisie dzień-miesiąc-rok", async () => {
        render(<GusStatusBadge status="DIFF" checkedAt="2026-09-09T05:31:00.000Z" />);
        fireEvent.mouseOver(screen.getByText(/GUS: różni się/));
        expect(await screen.findByText("Sprawdzono w GUS: 09-09-2026")).toBeInTheDocument();
    });

    it("bez daty sprawdzenia nie ma czego pokazywać w dymku", () => {
        render(<GusStatusBadge status="NOT_CHECKED" />);
        fireEvent.mouseOver(screen.getByText(/GUS: nie sprawdzano/));
        expect(screen.queryByText(/Sprawdzono w GUS/)).not.toBeInTheDocument();
    });
});
