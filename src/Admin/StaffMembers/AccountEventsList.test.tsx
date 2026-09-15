import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PersonAccountEventData } from "../../../Typings/bussinesTypes";

/**
 * ROD-3: sekcja „Ostatnie zmiany konta". Testowana jest reguła „co pokazać" (etykiety par
 * rodzaj/pole, wartości logiczne, rola z numeru, lista projektów) i trzy stany listy.
 */
const hoisted = vi.hoisted(() => ({
    fetchPersonAccountEvents: vi.fn(),
}));

vi.mock("../../Persons/personsV2Helpers", () => ({
    fetchPersonAccountEvents: hoisted.fetchPersonAccountEvents,
}));
vi.mock("../../React/MainSetupReact", () => ({
    default: {
        SystemRoles: {
            ADMIN: { id: 1 },
            EXTERNAL_USER: { id: 5 },
        },
    },
}));

import { AccountEventsList, describeAccountEvent } from "./AccountEventsList";

const event = (over: Partial<PersonAccountEventData>): PersonAccountEventData => ({
    id: 1,
    personId: 613,
    editorId: 125,
    eventType: "ACCOUNT",
    field: "systemRoleId",
    valueBefore: "5",
    valueAfter: "1",
    _createdAt: "2026-09-08T10:15:00.000Z",
    _editorName: "Marek",
    _editorSurname: "Testowy",
    ...over,
});

describe("describeAccountEvent - reguła „co pokazać”", () => {
    it("rola: numer zamieniony na nazwę ze słownika, autor imieniem i nazwiskiem", () => {
        const view = describeAccountEvent(event({}));
        expect(view.what).toBe("Rola");
        expect(view.before).toBe("EXTERNAL_USER");
        expect(view.after).toBe("ADMIN");
        expect(view.who).toBe("Marek Testowy");
        expect(view.when).toMatch(/2026/);
    });

    it("wartości logiczne jako tak/nie; brak wartości jako kreska", () => {
        const view = describeAccountEvent(
            event({ field: "fidmanEnabled", valueBefore: null, valueAfter: "true" }),
        );
        expect(view.what).toBe("Użytkownik FIDmana");
        expect(view.before).toBe("—");
        expect(view.after).toBe("tak");
    });

    it("„aktywny” w panelu i w koncie to dwie różne etykiety", () => {
        const panel = describeAccountEvent(
            event({ eventType: "STAFF_FLAGS", field: "isActive", valueBefore: "true", valueAfter: "false" }),
        );
        const account = describeAccountEvent(
            event({ eventType: "ACCOUNT", field: "isActive", valueBefore: "true", valueAfter: "false" }),
        );
        expect(panel.what).toBe("Aktywny (panel)");
        expect(account.what).toBe("Konto aktywne");
        expect(panel.after).toBe("nie");
    });

    it("zakres projektów: lista jako wyliczenie, pusta jako „brak”", () => {
        const view = describeAccountEvent(
            event({
                eventType: "PROJECT_ASSIGNMENTS",
                field: "projectOurIds",
                valueBefore: "[]",
                valueAfter: '["ABC.01","XYZ.02"]',
            }),
        );
        expect(view.what).toBe("Zakres projektów");
        expect(view.before).toBe("brak");
        expect(view.after).toBe("ABC.01, XYZ.02");
    });

    it("brak autora w bazie = kreska; nieznane pole pokazuje surową nazwę", () => {
        const view = describeAccountEvent(
            event({ _editorName: null, _editorSurname: null, field: "cosNowego", valueBefore: '"a"', valueAfter: '"b"' }),
        );
        expect(view.who).toBe("—");
        expect(view.what).toBe("cosNowego");
        expect(view.after).toBe("b");
    });
});

describe("AccountEventsList - stany listy", () => {
    beforeEach(() => {
        hoisted.fetchPersonAccountEvents.mockReset();
    });

    it("pokazuje wiersze historii z autorem i zmianą", async () => {
        hoisted.fetchPersonAccountEvents.mockResolvedValue([
            event({ id: 1 }),
            event({ id: 2, eventType: "STAFF_FLAGS", field: "isDriver", valueBefore: "false", valueAfter: "true" }),
        ]);
        render(<AccountEventsList personId={613} />);
        expect(screen.getByText("Ostatnie zmiany konta")).toBeTruthy();
        await waitFor(() => expect(screen.getAllByText(/Marek Testowy/).length).toBe(2));
        expect(screen.getByText(/Kierowca/)).toBeTruthy();
        expect(hoisted.fetchPersonAccountEvents).toHaveBeenCalledWith(613);
    });

    it("pusta historia = „Brak zapisanych zmian.”", async () => {
        hoisted.fetchPersonAccountEvents.mockResolvedValue([]);
        render(<AccountEventsList personId={613} />);
        await waitFor(() => expect(screen.getByText("Brak zapisanych zmian.")).toBeTruthy());
    });

    it("błąd pobierania = komunikat, bez wywrócenia modalu", async () => {
        hoisted.fetchPersonAccountEvents.mockRejectedValue(new Error("403"));
        render(<AccountEventsList personId={613} />);
        await waitFor(() => expect(screen.getByText("Nie udało się pobrać historii zmian.")).toBeTruthy());
    });
});
