import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StaffPrivacyStatus from "./StaffPrivacyStatus";
import { personPrivacyStatus } from "../../Privacy/privacyApi";
vi.mock("../../Privacy/privacyApi", () => ({personPrivacyStatus: vi.fn()}));
const load = vi.mocked(personPrivacyStatus);
const acknowledgedAt = "2026-09-15T08:30:00.000Z";
beforeEach(() => load.mockReset());

it.each([
    ["missing", "Brak potwierdzenia zapoznania się."],
    ["confirmed", "Potwierdzono zapoznanie się:"],
    ["outdated", "Wymagane ponowne potwierdzenie. Poprzednie:"],
] as const)("shows %s without editable controls", async (status, text) => {
    load.mockResolvedValue(status === "missing" ? {status, acknowledgedAt: null} : {status, acknowledgedAt});
    const {container} = render(<StaffPrivacyStatus personId={42} />);
    await screen.findByText(text, {exact: false});
    expect(load).toHaveBeenCalledWith(42);
    expect(container.querySelector('input')).toBeNull();
    if (status !== "missing") {
        expect(container.querySelector('time')).toHaveAttribute('datetime', acknowledgedAt);
        expect(container.querySelector('time')).toHaveTextContent('10:30');
    }
});
it("shows an error instead of a false missing status and supports retry", async () => {
    load.mockRejectedValueOnce(new Error()).mockResolvedValue({status: "missing", acknowledgedAt: null});
    render(<StaffPrivacyStatus personId={42} />);
    const retry = await screen.findByRole("button", {name: "Spróbuj ponownie"});
    expect(screen.queryByText("Brak potwierdzenia zapoznania się.")).toBeNull();
    expect(retry).toHaveAttribute('type', 'button');
    fireEvent.click(retry);
    await screen.findByText("Brak potwierdzenia zapoznania się.");
});
it("ignores a late response for the previous person", async () => {
    let finish: (value: any) => void = () => {};
    load.mockImplementationOnce(() => new Promise(resolve => {finish = resolve;}))
        .mockResolvedValue({status: "missing", acknowledgedAt: null});
    const {rerender} = render(<StaffPrivacyStatus personId={42} />);
    rerender(<StaffPrivacyStatus personId={43} />);
    await screen.findByText("Brak potwierdzenia zapoznania się.");
    finish({status: "confirmed", acknowledgedAt});
    await waitFor(() => expect(screen.queryByText(/Potwierdzono zapoznanie/)).toBeNull());
});