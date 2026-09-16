import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PrivacyAcknowledgement from "./PrivacyAcknowledgement";
import { PrivacyStatus, observePrivacyRequired } from "./privacyApi";
import MainSetup from "../React/MainSetupReact";
const status: PrivacyStatus = { acknowledged: false, acknowledgedAt: null, notice: {
    scope: "SYSTEM", version: "1", revision: "1", title: "Informacja", sections: [{heading: "Kontakt", text: "Biuro ENVI"}],
    isPlaceholder: false,
}};
describe("privacy acknowledgement", () => {
    it("shows only the application spinner while checking a stored acknowledgement", async () => {
        let resolveStatus!: (value: PrivacyStatus) => void;
        const load = vi.fn().mockReturnValue(new Promise<PrivacyStatus>(resolve => { resolveStatus = resolve; }));
        render(<PrivacyAcknowledgement load={load} acknowledge={vi.fn()} onContinue={vi.fn()} />);
        expect(screen.getByRole("status")).toBeInTheDocument();
        expect(screen.queryByText("Prywatność i dane osobowe")).not.toBeInTheDocument();
        resolveStatus(status);
        expect(await screen.findByRole("checkbox")).toBeInTheDocument();
    });
    it("waits for an explicit checked acknowledgement and successful server save", async () => {
        const ack = vi.fn().mockRejectedValueOnce(new Error()).mockResolvedValue({ ...status, acknowledged: true });
        const proceed = vi.fn();
        render(<PrivacyAcknowledgement load={vi.fn().mockResolvedValue(status)} acknowledge={ack} onContinue={proceed} />);
        const box = await screen.findByRole("checkbox");
        expect(box).not.toBeChecked();
        expect(screen.getByRole("button", {name: "Przejdź dalej"})).toBeDisabled();
        fireEvent.click(box); fireEvent.click(screen.getByRole("button", {name: "Przejdź dalej"}));
        await screen.findByText(/Nie udało się zapisać/);
        expect(proceed).not.toHaveBeenCalled();
        expect(box).not.toBeChecked();
        fireEvent.click(box); fireEvent.click(screen.getByRole("button", {name: "Przejdź dalej"}));
        await waitFor(() => expect(proceed).toHaveBeenCalledOnce());
        expect(ack).toHaveBeenCalledWith(status.notice);
    });
    it("skips the gate for an acknowledgement already stored on the account", async () => {
        const proceed = vi.fn();
        render(<PrivacyAcknowledgement load={vi.fn().mockResolvedValue({...status, acknowledged: true})} acknowledge={vi.fn()} onContinue={proceed} />);
        await waitFor(() => expect(proceed).toHaveBeenCalledOnce());
    });
    it("fails closed and allows retry after a status outage", async () => {
        const proceed = vi.fn();
        const load = vi.fn().mockRejectedValueOnce(new Error()).mockResolvedValue(status);
        render(<PrivacyAcknowledgement load={load} acknowledge={vi.fn()} onContinue={proceed} />);
        fireEvent.click(await screen.findByRole("button", {name: "Spróbuj ponownie"}));
        await screen.findByRole("checkbox");
        expect(proceed).not.toHaveBeenCalled();
    });
    it("reloads stale content and clears the checkbox", async () => {
        const load = vi.fn().mockResolvedValueOnce(status).mockResolvedValue({...status, notice: {...status.notice, version: "2", sections: [{heading: "Kontakt", text: "Aktualny kontakt ENVI"}]}});
        const proceed = vi.fn();
        render(<PrivacyAcknowledgement load={load} acknowledge={vi.fn().mockRejectedValue({status: 409})} onContinue={proceed} />);
        fireEvent.click(await screen.findByRole("checkbox"));
        fireEvent.click(screen.getByRole("button", {name: "Przejdź dalej"}));
        await screen.findByText("Aktualny kontakt ENVI");
        expect(screen.getByRole("checkbox")).not.toBeChecked();
        expect(proceed).not.toHaveBeenCalled();
    });
    it("observes legacy business fetch 428 but excludes public-token requests", async () => {
        const previous = window.fetch;
        window.fetch = vi.fn().mockResolvedValue({status: 428});
        const required = vi.fn(); const cleanup = observePrivacyRequired(required);
        try {
            await fetch(MainSetup.serverUrl + "persons");
            await fetch(MainSetup.serverUrl + "v2/public/experience-update/token/draft");
            expect(required).toHaveBeenCalledOnce();
        } finally { cleanup(); window.fetch = previous; }
    });
});
