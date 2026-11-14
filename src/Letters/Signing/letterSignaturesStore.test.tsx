import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MainSetup from "../../React/MainSetupReact";
import { SigningApi } from "../../Signing/SigningApi";
import { resetLetterSignaturesStore, useLetterSignatures } from "./letterSignaturesStore";

function Probe() {
    const entry = useLetterSignatures(7);
    return <span>{entry === undefined ? "czeka" : "wiadomo"}</span>;
}

describe("podpisy pism na liscie (DOSTEP-1)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        resetLetterSignaturesStore();
    });

    function lista(role: string) {
        vi.spyOn(MainSetup, "currentUserOrNull", "get").mockReturnValue({ systemRoleName: role } as any);
        const spy = vi.spyOn(SigningApi, "summarizeSignatures").mockResolvedValue({ summary: {} } as any);
        render(<Probe />);
        return spy;
    }

    it("rola zakresowa nie pyta serwera (trasa zamknieta, byłoby 403)", async () => {
        const spy = lista("ENVI_COOPERATOR");
        await waitFor(() => expect(screen.getByText("wiadomo")).toBeTruthy());
        expect(spy).not.toHaveBeenCalled();
    });

    it("pracownik ENVI pyta jak dotad", async () => {
        const spy = lista("ENVI_EMPLOYEE");
        await waitFor(() => expect(spy).toHaveBeenCalledWith([7]));
    });
});
