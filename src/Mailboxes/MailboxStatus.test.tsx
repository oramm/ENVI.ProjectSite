import React, { StrictMode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MailboxStatus, useMailboxConfirmation } from "./MailboxStatus";
import { MailboxRecord } from "./mailboxesService";

const mocks = vi.hoisted(() => ({ action: vi.fn(), onSaved: vi.fn() }));
vi.mock("./mailboxesService", () => ({ mailboxAction: mocks.action, fetchMailboxes: vi.fn() }));
const ACTIVE: MailboxRecord = { id: 3, code: "chc-01", address: "chc.01@envi.com.pl", projectId: 4,
    contractId: null, statusCode: "ACTIVE", lastError: null };

describe("stan skrzynki i jednorazowe hasło", () => {
    beforeEach(() => { vi.clearAllMocks(); });
    it("po rejestracji pobiera hasło raz, także przy powtórzeniu efektu React", async () => {
        mocks.action.mockResolvedValue({ password: "Jednorazowe12345" });
        const { rerender } = render(<StrictMode><MailboxStatus initialMailbox={ACTIVE} showInitialPassword /></StrictMode>);
        await waitFor(() => expect(screen.getByLabelText("Nowe hasło skrzynki")).toHaveValue("Jednorazowe12345"));
        expect(mocks.action).toHaveBeenCalledTimes(1);
        expect(mocks.action).toHaveBeenCalledWith(3, "password");
        expect(screen.getByText("Zapisz teraz - PS go nie pamięta i nie pokaże ponownie")).toBeInTheDocument();
        fireEvent.click(screen.getByText("Ukryj hasło"));
        rerender(<StrictMode><MailboxStatus initialMailbox={ACTIVE} showInitialPassword /></StrictMode>);
        expect(screen.queryByLabelText("Nowe hasło skrzynki")).toBeNull();
        expect(mocks.action).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(sessionStorage)).not.toContain("Jednorazowe12345");
        expect(JSON.stringify(localStorage)).not.toContain("Jednorazowe12345");
    });
    it("zwykły widok skrzynki nie zmienia hasła", () => {
        render(<MailboxStatus initialMailbox={ACTIVE} />);
        expect(mocks.action).not.toHaveBeenCalled();
        expect(screen.queryByLabelText("Nowe hasło skrzynki")).toBeNull();
    });
    it("ponawia założenie i pokazuje nowe hasło po sukcesie", async () => {
        mocks.action.mockResolvedValueOnce(ACTIVE).mockResolvedValueOnce({ password: "Nowe123456789012" });
        render(<MailboxStatus initialMailbox={{ ...ACTIVE, statusCode: "PENDING", lastError: "Brak konfiguracji" }} showInitialPassword />);
        expect(screen.getByText("Do założenia: Brak konfiguracji")).toBeInTheDocument();
        fireEvent.click(screen.getByText("Ponów"));
        await waitFor(() => expect(screen.getByLabelText("Nowe hasło skrzynki")).toHaveValue("Nowe123456789012"));
        expect(mocks.action.mock.calls).toEqual([[3, "provision"], [3, "password"]]);
        expect(screen.getByText("Założona")).toBeInTheDocument();
    });
    it("odrzucone ponowienie pozostawia komunikat i nie żąda hasła", async () => {
        mocks.action.mockResolvedValue({ ...ACTIVE, statusCode: "PENDING", lastError: "Zajęty adres" });
        render(<MailboxStatus initialMailbox={{ ...ACTIVE, statusCode: "PENDING" }} />);
        fireEvent.click(screen.getByText("Ponów"));
        await waitFor(() => expect(screen.getByText("Do założenia: Zajęty adres")).toBeInTheDocument());
        expect(mocks.action).toHaveBeenCalledTimes(1);
    });
    it("pokazuje bezpieczny błąd zmiany hasła i pozwala ponowić", async () => {
        mocks.action.mockRejectedValue(new Error("Brak połączenia z serwerem poczty"));
        render(<MailboxStatus initialMailbox={ACTIVE} showInitialPassword />);
        await waitFor(() => expect(screen.getByText("Brak połączenia z serwerem poczty")).toBeInTheDocument());
        expect(screen.queryByLabelText("Nowe hasło skrzynki")).toBeNull();
        expect(screen.getByText("Zmień hasło")).not.toBeDisabled();
    });
    it("przenosi skrzynkę kontraktu do projektu bez zmiany hasła", async () => {
        mocks.action.mockResolvedValue(ACTIVE);
        render(<MailboxStatus initialMailbox={{ ...ACTIVE, contractId: 8, projectId: null }} />);
        fireEvent.click(screen.getByText("Przenieś skrzynkę do projektu"));
        await waitFor(() => expect(screen.queryByText("Przenieś skrzynkę do projektu")).toBeNull());
        expect(mocks.action.mock.calls).toEqual([[3, "project"]]);
    });
    it("zamyka potwierdzenie razem z hasłem, a istniejąca skrzynka nie resetuje hasła", async () => {
        function Harness() {
            const { onSaved, confirmation } = useMailboxConfirmation<{ id: number }>(mocks.onSaved);
            return <><button onClick={() => void onSaved({ id: 12, _mailbox: ACTIVE, _mailboxCreated: false } as any)}>Zapisz</button>{confirmation}</>;
        }
        render(<Harness />);
        fireEvent.click(screen.getByText("Zapisz"));
        await waitFor(() => expect(screen.getByText("Skrzynka e-mail po rejestracji")).toBeInTheDocument());
        expect(mocks.action).not.toHaveBeenCalled();
        fireEvent.click(screen.getByText("Zamknij"));
        await waitFor(() => expect(screen.queryByText("Skrzynka e-mail po rejestracji")).toBeNull());
    });
    it("nowa skrzynka w potwierdzeniu otrzymuje hasło i zapomina je po zamknięciu", async () => {
        mocks.action.mockResolvedValue({ password: "TylkoRaz12345678" });
        function Harness() {
            const { onSaved, confirmation } = useMailboxConfirmation<{ id: number }>(mocks.onSaved);
            return <><button onClick={() => void onSaved({ id: 12, _mailbox: ACTIVE, _mailboxCreated: true } as any)}>Zapisz</button>{confirmation}</>;
        }
        render(<Harness />);
        fireEvent.click(screen.getByText("Zapisz"));
        await waitFor(() => expect(screen.getByLabelText("Nowe hasło skrzynki")).toHaveValue("TylkoRaz12345678"));
        fireEvent.click(screen.getByText("Zamknij"));
        await waitFor(() => expect(screen.queryByLabelText("Nowe hasło skrzynki")).toBeNull());
        expect(mocks.action).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(mocks.onSaved.mock.calls)).not.toContain("TylkoRaz12345678");
    });
});
