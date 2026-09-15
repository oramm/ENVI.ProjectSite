import React from "react";
import { act, fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InvoiceSeriesModal } from "./InvoiceSeriesModal";
import { invoiceSeriesRequest } from "../invoiceSeriesApi";

vi.mock("../invoiceSeriesApi", () => ({ invoiceSeriesRequest: vi.fn() }));
const request = vi.mocked(invoiceSeriesRequest);
const invoice = { id: 7, issueDate: "2027-01-31" } as any;
const preview = { saleDates: ["2027-01-31", "2027-02-28", "2027-03-31"], netAmount: 100, grossAmount: 123 };

afterEach(cleanup);
beforeEach(() => {
    request.mockReset();
    request.mockImplementation(async route => route.endsWith("/preview") ? preview : { invoiceIds: [8, 9] });
});
function open() { return render(<InvoiceSeriesModal invoice={invoice} show onHide={() => {}} />); }

describe("invoice series form", () => {
    it("labels the source, previews the amounts and sends the default anchor as null", async () => {
        open();
        expect(await screen.findByText("Istniejąca (źródłowa)")).toBeInTheDocument();
        expect(screen.getByText(/Nowe faktury zostaną zapisane od razu/)).toBeInTheDocument();
        expect(screen.queryByText(/Obejmuje fakturę źródłową/)).not.toBeInTheDocument();
        expect(screen.getByLabelText("Łączna liczba faktur")).toHaveAttribute("max", "100");
        expect(screen.getByLabelText("Powtarzaj co … miesięcy")).toHaveAttribute("max", "12");
        expect(screen.getByLabelText("Data pierwszej nowej faktury")).toHaveValue("2027-02-28");
        expect(screen.getAllByText(/123,00/)).toHaveLength(3);
        expect(request).toHaveBeenLastCalledWith("invoiceSeries/preview",
            { sourceInvoiceId: 7, totalCount: 2, intervalMonths: 1, firstSaleDate: null }, expect.any(AbortSignal));
    });
    it("refreshes all inputs, retains a manual anchor and restores the source anchor", async () => {
        open();
        await screen.findByText("Istniejąca (źródłowa)");
        fireEvent.change(screen.getByLabelText("Łączna liczba faktur"), { target: { value: "50" } });
        fireEvent.change(screen.getByLabelText("Powtarzaj co … miesięcy"), { target: { value: "2" } });
        fireEvent.change(screen.getByLabelText("Data pierwszej nowej faktury"), { target: { value: "2027-03-15" } });
        fireEvent.change(screen.getByLabelText("Data pierwszej nowej faktury"), { target: { value: "2027-02-28" } });
        await waitFor(() => expect(request).toHaveBeenLastCalledWith("invoiceSeries/preview",
            { sourceInvoiceId: 7, totalCount: 50, intervalMonths: 2, firstSaleDate: "2027-02-28" }, expect.any(AbortSignal)));
        expect(await screen.findByRole("button", { name: "Utwórz 49 nowych faktur" })).toBeEnabled();
        fireEvent.click(screen.getByRole("button", { name: "Przywróć datę domyślną" }));
        await waitFor(() => expect(request).toHaveBeenLastCalledWith("invoiceSeries/preview",
            expect.objectContaining({ firstSaleDate: null }), expect.any(AbortSignal)));
    });
    it("guards double clicks and keeps the same request ID after an uncertain response", async () => {
        let rejectSave!: (reason: Error) => void;
        request.mockImplementation(async route => {
            if (route.endsWith("/preview")) return preview;
            return new Promise((_resolve, reject) => { rejectSave = reject; });
        });
        open();
        const button = await screen.findByRole("button", { name: "Utwórz 1 nową fakturę" });
        await waitFor(() => expect(button).toBeEnabled());
        fireEvent.click(button);
        fireEvent.click(button);
        expect(request.mock.calls.filter(call => call[0] === "invoiceSeries")).toHaveLength(1);
        expect(screen.getByRole("button", { name: "Zamknij" })).toBeDisabled();
        await act(async () => rejectSave(new Error("Połączenie zerwane")));
        expect(await screen.findByText("Połączenie zerwane")).toBeInTheDocument();
        const first = request.mock.calls.find(call => call[0] === "invoiceSeries")![1];
        request.mockResolvedValueOnce({ invoiceIds: [8] });
        fireEvent.click(screen.getByRole("button", { name: "Utwórz 1 nową fakturę" }));
        await screen.findByText(/Utworzono 1 nową fakturę/);
        const saves = request.mock.calls.filter(call => call[0] === "invoiceSeries");
        expect(saves).toHaveLength(2);
        expect(saves[1][1]).toEqual(first);
    });
    it.each([
        ["Łączna liczba faktur", "101"],
        ["Powtarzaj co … miesięcy", "13"],
    ])("rejects an exceeded limit in %s", async (label, value) => {
        open();
        await screen.findByText("Istniejąca (źródłowa)");
        fireEvent.change(screen.getByLabelText(label), { target: { value } });
        expect(screen.getByRole("button", { name: "Utwórz 0 nowych faktur" })).toBeDisabled();
        expect(request.mock.calls.filter(call => call[0] === "invoiceSeries")).toHaveLength(0);
    });
    it("does not submit a stale preview or invalid count", async () => {
        open();
        await screen.findByText("Istniejąca (źródłowa)");
        fireEvent.change(screen.getByLabelText("Łączna liczba faktur"), { target: { value: "1" } });
        expect(screen.getByRole("button", { name: "Utwórz 0 nowych faktur" })).toBeDisabled();
        expect(request.mock.calls.filter(call => call[0] === "invoiceSeries")).toHaveLength(0);
    });
});
