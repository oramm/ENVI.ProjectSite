import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MainSetup from "../../../React/MainSetupReact";
import { PartialEditTrigger } from "./ContractMainHeader";

// Prawdziwy trigger otwiera modal, który zapisuje przez PUT /contract/:id (zamknięty dla ról zakresowych).
vi.mock("../../../View/Modals/GeneralModalButtons", () => ({
    PartialEditTrigger: ({ children }: { children: JSX.Element }) => (
        <span onClick={() => (globalThis as any).__edytowano++}>{children}</span>
    ),
}));

describe("naglowek kontraktu: edycja pol (DOSTEP-1)", () => {
    afterEach(() => vi.restoreAllMocks());

    function klik(role: string | null) {
        (globalThis as any).__edytowano = 0;
        vi.spyOn(MainSetup, "currentUserOrNull", "get").mockReturnValue(role ? ({ systemRoleName: role } as any) : null);
        render(<PartialEditTrigger modalProps={{} as any}><b>Nazwa</b></PartialEditTrigger>);
        fireEvent.click(screen.getByText("Nazwa"));
        return (globalThis as any).__edytowano as number;
    }

    it.each(["CONTRACT_WORKER", "CLIENT", "ENVI_COOPERATOR", "EXTERNAL_USER"])("%s widzi pole bez edycji", (role) => {
        expect(klik(role)).toBe(0);
    });

    it.each(["ADMIN", "ENVI_MANAGER", "ENVI_EMPLOYEE"])("%s nadal edytuje", (role) => {
        expect(klik(role)).toBe(1);
    });
});
