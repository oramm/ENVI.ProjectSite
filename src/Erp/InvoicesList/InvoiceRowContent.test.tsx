/**
 * Testy prezentacyjne wiersza listy faktur — reguły z makiety `tmp/makieta-lista-faktur-v1.html`,
 * wariant A, z poprawką właściciela „bez nazwy kontraktu”:
 *  - górna linia kontekstu: oznaczenie kontraktu, projekt, alias, typ — i NIE nazwa kontraktu;
 *  - podmioty trzecie widoczne z nazwą roli (nie z numerem KSeF);
 *  - stara, pojedyncza forma podmiotu trzeciego też wchodzi do wiersza;
 *  - daty w kolumnie bocznej, przeterminowany termin płatności podświetlony;
 *  - stopka pokazuje właściciela i ostatni zapis, a puste pole wychodzi jako „—”.
 */
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { InvoiceRowContent } from "./InvoiceRowContent";

const WARN = "rgb(143, 84, 6)"; // #8f5406 — jsdom normalizuje kolory do rgb()

function invoice(overrides: any = {}) {
    return {
        id: 175,
        number: "175/2026",
        status: "Wysłana",
        issueDate: "2026-07-03",
        sentDate: "2026-07-03",
        paymentDeadline: "2036-07-04",
        description: "Nadzór inwestorski — czerwiec 2026",
        _entity: { id: 9, name: "Gmina Kościerzyce", address: "Kościerzyce 201", taxNumber: "7471234567" },
        _contract: {
            id: 4,
            ourId: "TES.IK.04",
            alias: "Nadzór Kościerzyce",
            name: "Pełnienie nadzoru inwestorskiego",
            _type: { id: 1, name: "IK", isOur: true },
            _project: { id: 2, ourId: "2026.TES.01" },
        },
        _owner: { id: 1, name: "Agnieszka", surname: "Brodziak" },
        _editor: { id: 2, name: "Michał", surname: "Kot" },
        _lastUpdated: "2026-07-14T09:12:00",
        _totalNetValue: 1,
        _totalGrossValue: 1.23,
        ...overrides,
    } as any;
}

describe("InvoiceRowContent", () => {
    it("pokazuje kontekst kontraktu bez nazwy kontraktu", () => {
        render(<InvoiceRowContent invoice={invoice()} />);

        expect(screen.getByText("TES.IK.04")).toBeInTheDocument();
        expect(screen.getByText("2026.TES.01")).toBeInTheDocument();
        expect(screen.getByText("Nadzór Kościerzyce")).toBeInTheDocument();
        expect(screen.getByText("IK")).toBeInTheDocument();
        expect(screen.queryByText("Pełnienie nadzoru inwestorskiego")).not.toBeInTheDocument();
    });

    it("wypisuje podmioty trzecie z nazwą roli", () => {
        render(
            <InvoiceRowContent
                invoice={invoice({
                    _thirdParties: [
                        { role: 8, _entity: { id: 11, name: "ZWiK w Kościerzycach", taxNumber: "7471112233" } },
                        { role: 6, _entity: { id: 12, name: "Urząd Gminy Kościerzyce" } },
                    ],
                })}
            />
        );

        expect(screen.getByText("Podmioty trzecie")).toBeInTheDocument();
        expect(screen.getByText("JST odbiorca")).toBeInTheDocument();
        expect(screen.getByText("ZWiK w Kościerzycach")).toBeInTheDocument();
        expect(screen.getByText("Dokonujący płatności")).toBeInTheDocument();
        expect(screen.getByText("Urząd Gminy Kościerzyce")).toBeInTheDocument();
    });

    it("bierze też starą, pojedynczą formę podmiotu trzeciego", () => {
        render(
            <InvoiceRowContent
                invoice={invoice({
                    includeThirdParty: true,
                    _thirdParty: { id: 13, name: "Stary podmiot trzeci" },
                })}
            />
        );

        expect(screen.getByText("Stary podmiot trzeci")).toBeInTheDocument();
    });

    it("nie pokazuje sekcji podmiotów trzecich, gdy ich nie ma", () => {
        render(<InvoiceRowContent invoice={invoice()} />);

        expect(screen.queryByText("Podmioty trzecie")).not.toBeInTheDocument();
    });

    it("stawia daty w kolumnie terminów i podświetla przeterminowaną płatność", () => {
        render(<InvoiceRowContent invoice={invoice({ paymentDeadline: "2026-07-04" })} />);

        // Sprzedaż i wystawienie mają tu tę samą datę, stąd dwa trafienia.
        expect(screen.getAllByText("03-07-2026")).toHaveLength(2);
        const deadline = screen.getByText("04-07-2026");
        expect(deadline).toHaveStyle({ color: WARN });
    });

    it("stopka pokazuje właściciela i ostatni zapis, a brak edytora jako myślnik", () => {
        const { rerender } = render(<InvoiceRowContent invoice={invoice()} />);
        expect(screen.getByText("Agnieszka Brodziak")).toBeInTheDocument();
        expect(screen.getByText("Michał Kot")).toBeInTheDocument();
        expect(screen.getByText(/aktualizacja:/)).toBeInTheDocument();

        rerender(<InvoiceRowContent invoice={invoice({ _editor: undefined })} />);
        expect(screen.getByText("—")).toBeInTheDocument();
    });
});
