import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FidmanUserSyncStatus } from "../../../Typings/bussinesTypes";
import { describeFidmanUserSync, FidmanUserSyncBadge, FidmanUserSyncLine } from "./FidmanUserSyncBadge";

/**
 * Plakietka stanu konta w FIDmanie (D-PER-8). Testowana jest reguła „co pokazać",
 * bo to ona rozstrzyga, czy administrator zobaczy problem, czy nie.
 */
const sync = (over: Partial<FidmanUserSyncStatus>): FidmanUserSyncStatus => ({
    status: "SENT",
    requestedEnabled: true,
    skipReason: null,
    skipReasonLabel: null,
    lastError: null,
    attempts: 1,
    updatedAt: "2026-09-04T09:50:16.000Z",
    ...over,
});

describe("describeFidmanUserSync - flaga włączona", () => {
    it("bez wiersza kolejki: „nie wysłano”, bo flaga bez wysyłki to konto, którego nie ma", () => {
        const view = describeFidmanUserSync(true, null);
        expect(view?.label).toBe("FIDman: nie wysłano");
        expect(view?.variant).toBe("light");
    });

    it("wysłano = zielona z datą", () => {
        const view = describeFidmanUserSync(true, sync({ status: "SENT" }));
        expect(view?.variant).toBe("success");
        expect(view?.label).toBe("FIDman: wysłano");
        expect(view?.title).toMatch(/2026/);
    });

    it("oczekuje = szara, z informacją o ponawianiu", () => {
        const view = describeFidmanUserSync(true, sync({ status: "PENDING" }));
        expect(view?.variant).toBe("secondary");
        expect(view?.title).toContain("co minutę");
    });

    it("błąd = czerwona, a treść błędu i numer próby w szczególe", () => {
        const view = describeFidmanUserSync(
            true,
            sync({ status: "FAILED", lastError: "FIDMAN_SYNC_BASE_URL nie ustawione", attempts: 3 }),
        );
        expect(view?.variant).toBe("danger");
        expect(view?.label).toBe("FIDman: błąd");
        expect(view?.title).toContain("FIDMAN_SYNC_BASE_URL nie ustawione");
        expect(view?.title).toContain("próba 3");
    });

    it("pominięto = żółta, z powodem po ludzku, gdy serwer go dał", () => {
        const view = describeFidmanUserSync(
            true,
            sync({
                status: "SKIPPED",
                skipReason: "ENTITY_NOT_IN_FIDMAN",
                skipReasonLabel: "Podmiotu tej osoby nie ma jeszcze w FIDmanie.",
            }),
        );
        expect(view?.variant).toBe("warning");
        expect(view?.label).toBe("FIDman: pominięto");
        expect(view?.title).toContain("Podmiotu tej osoby");
    });

    it("bez etykiety powodu pokazuje surowy kod, nie pustkę", () => {
        const view = describeFidmanUserSync(true, sync({ status: "SKIPPED", skipReason: "NOWY_POWOD" }));
        expect(view?.title).toContain("NOWY_POWOD");
    });
});

describe("describeFidmanUserSync - flaga wyłączona", () => {
    it("bez wiersza kolejki nic nie pokazuje - osoba spoza FIDmana", () => {
        expect(describeFidmanUserSync(false, null)).toBeNull();
    });

    it("wyłączenie, które doszło, nie dostaje plakietki - to stan normalny", () => {
        expect(describeFidmanUserSync(false, sync({ status: "SENT", requestedEnabled: false }))).toBeNull();
    });

    it("wyłączenie z błędem ostrzega: konto w FIDmanie nadal żyje", () => {
        const view = describeFidmanUserSync(false, sync({ status: "FAILED", requestedEnabled: false, lastError: "HTTP 500" }));
        expect(view?.variant).toBe("danger");
        expect(view?.label).toBe("FIDman: błąd wyłączenia");
    });

    it("wyłączenie pominięte (np. ostatni administrator) ostrzega z powodem", () => {
        const view = describeFidmanUserSync(
            false,
            sync({ status: "SKIPPED", requestedEnabled: false, skipReasonLabel: "To ostatnie włączone konto administratora FIDmana." }),
        );
        expect(view?.variant).toBe("warning");
        expect(view?.label).toBe("FIDman: wyłączenie pominięte");
        expect(view?.title).toContain("ostatnie włączone konto");
    });

    it("flaga zgaszona, a ostatnia wysyłka włączała konto = wyłączenia nie wysłano", () => {
        // Serwer nie wysyła wyłączenia, gdy dane osoby nie spełniają kontraktu FIDmana
        // (ostrzeżenie w logu) - konto zostaje włączone po tamtej stronie.
        const view = describeFidmanUserSync(false, sync({ status: "SENT", requestedEnabled: true }));
        expect(view?.variant).toBe("warning");
        expect(view?.label).toBe("FIDman: wyłączenie nie wysłane");
        expect(view?.title).toContain("ręcznie");
    });
});

describe("komponenty", () => {
    it("plakietka niesie etykietę i szczegół w title", () => {
        render(<FidmanUserSyncBadge enabled sync={sync({ status: "FAILED", lastError: "HTTP 502" })} />);
        const badge = screen.getByTestId("fidman-sync-badge");
        expect(badge).toHaveTextContent("FIDman: błąd");
        expect(badge).toHaveAttribute("title", expect.stringContaining("HTTP 502"));
    });

    it("plakietka znika, gdy nie ma czego pokazać", () => {
        render(<FidmanUserSyncBadge enabled={false} sync={null} />);
        expect(screen.queryByTestId("fidman-sync-badge")).not.toBeInTheDocument();
    });

    it("linia w modalu mówi pełnym zdaniem", () => {
        render(<FidmanUserSyncLine enabled sync={sync({ status: "SENT" })} />);
        expect(screen.getByTestId("fidman-sync-line")).toHaveTextContent("Ostatnia wysyłka do FIDmana: wysłano.");
    });
});
