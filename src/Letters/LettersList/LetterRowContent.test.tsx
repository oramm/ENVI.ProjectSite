/**
 * PIS-2 (PS.APP.01, pack PIS) — testy prezentacyjne wspólnego wiersza rejestru pism.
 * Sprawdzają reguły z zatwierdzonej makiety: kamień milowy raz gdy wspólny, drzewko przy
 * każdej sprawie, etykieta drugiej daty zależna od kierunku, znacznik agenta, kontekst
 * ofertowy bez kontraktu.
 */
import { render, screen, within } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { LetterRowContent, LetterRowMarkers } from "./LetterRowContent";

const GREEN = "rgb(22, 98, 67)"; // #166243 — jsdom normalizuje kolory do rgb()
const STEEL_BLUE = "rgb(75, 90, 144)"; // #4b5a90 — kolor agenta, poza paletą statusów

function makeCase(id: number, displayNumber: string, milestoneName: string, contract: any) {
    return {
        id,
        _displayNumber: displayNumber,
        name: `sprawa ${displayNumber}`,
        _type: { id: 1, name: "Zmiany" },
        _parent: { id: 100 + id, name: "", _type: { id: 50, name: milestoneName }, _contract: contract, _dates: [] },
    } as any;
}

const otherContract = {
    id: 1620,
    number: "22/2025",
    _type: { id: 3, name: "Żółty", isOur: false },
    _contractors: [{ id: 1, name: "Kobylarnia S.A.", shortName: "Kobylarnia" }],
    ourIdRelated: "MIE.IK.03",
};

const ourContract = {
    id: 1784,
    number: "1",
    ourId: "KEP.IK.02",
    _type: { id: 1, name: "IK", isOur: true },
    _contractors: [],
};

function baseLetter(overrides: any = {}) {
    return {
        id: 6159,
        number: "6159",
        description: "Odpowiedź na pismo Wykonawcy",
        creationDate: "2026-07-30",
        registrationDate: "2026-07-30",
        status: "Utworzony",
        isOur: true,
        _project: { id: 74, ourId: "MIE.GWS.02.PLAD" },
        _cases: [makeCase(1, "S13", "Administracja - umowa zewnętrzna", otherContract)],
        _lastEvent: {
            id: 1,
            eventType: "CREATED",
            _lastUpdated: "2026-07-30T07:10:04.000Z",
            _editor: { id: 610, name: "Angelika", surname: "Krzyżek" },
        },
        ...overrides,
    } as any;
}

describe("LetterRowContent — kontekst kontraktowy", () => {
    it("kontrakt wykonawcy: szara plakietka z numerem umowy, wykonawca, projekt i linia nadzoru", () => {
        render(<LetterRowContent letter={baseLetter()} context="contract" />);
        const chip = screen.getByTitle("Kontrakt wykonawcy");
        expect(chip).toHaveTextContent("22/2025");
        expect(chip.style.backgroundColor).not.toBe(GREEN);
        expect(screen.getByText("MIE.GWS.02.PLAD")).toBeInTheDocument();
        expect(screen.getByText("Kobylarnia")).toBeInTheDocument();
        expect(screen.getByText("Żółty")).toBeInTheDocument();
        expect(screen.getByText("MIE.IK.03")).toBeInTheDocument();
    });

    it("nasz kontrakt: zielona plakietka z naszym oznaczeniem i bez linii nadzoru", () => {
        const letter = baseLetter({
            _cases: [makeCase(1, "S04", "Administracja", ourContract)],
        });
        const { container } = render(<LetterRowContent letter={letter} context="contract" />);
        const chip = screen.getByTitle("Nasz kontrakt");
        expect(chip).toHaveTextContent("KEP.IK.02");
        expect(chip.style.backgroundColor).toBe(GREEN);
        expect(container.textContent).not.toContain("nasz nadzór");
    });

    it("kamień milowy raz, gdy wspólny dla wszystkich spraw", () => {
        const letter = baseLetter({
            _cases: [
                makeCase(1, "S13", "Administracja - umowa zewnętrzna", otherContract),
                makeCase(2, "S17", "Administracja - umowa zewnętrzna", otherContract),
            ],
        });
        const { container } = render(<LetterRowContent letter={letter} context="contract" />);
        expect(screen.getAllByText("Administracja - umowa zewnętrzna")).toHaveLength(1);
        // drzewko przy KAŻDEJ sprawie, ostatnia gałąź zamknięta
        expect(container.textContent).toContain("├");
        expect(container.textContent).toContain("└");
    });

    it("kamień milowy przy każdej sprawie, gdy sprawy leżą w różnych kamieniach", () => {
        const letter = baseLetter({
            _cases: [
                makeCase(1, "S00", "Administracja - umowa zewnętrzna", otherContract),
                makeCase(2, "S53", "Projektowanie - nadzór", otherContract),
            ],
        });
        render(<LetterRowContent letter={letter} context="contract" />);
        expect(screen.getByText("Administracja - umowa zewnętrzna")).toBeInTheDocument();
        expect(screen.getByText("Projektowanie - nadzór")).toBeInTheDocument();
    });

    it("drzewko stoi także przy pojedynczej sprawie", () => {
        const { container } = render(<LetterRowContent letter={baseLetter()} context="contract" />);
        expect(container.textContent).toContain("└");
    });

    it("pasek meta: pismo wychodzące ma „wysłano”, przychodzące „wpłynęło”", () => {
        const { rerender } = render(<LetterRowContent letter={baseLetter()} context="contract" />);
        expect(screen.getByText("wysłano")).toBeInTheDocument();
        expect(screen.queryByText("wpłynęło")).not.toBeInTheDocument();

        rerender(<LetterRowContent letter={baseLetter({ isOur: false })} context="contract" />);
        expect(screen.getByText("wpłynęło")).toBeInTheDocument();
    });

    it("termin odpowiedzi wyróżniony po przekroczeniu, zwykły przed", () => {
        render(<LetterRowContent letter={baseLetter({ responseDueDate: "2020-01-02" })} context="contract" />);
        expect(screen.getByText("02-01-2020").style.color).toBe("rgb(143, 84, 6)");

        render(<LetterRowContent letter={baseLetter({ responseDueDate: "2099-01-02" })} context="contract" />);
        expect(screen.getByText("02-01-2099").style.color).not.toBe("rgb(143, 84, 6)");
    });
});

describe("LetterRowContent — znacznik agenta", () => {
    it("w kolumnie znaczników, kolorem spoza palety statusów", () => {
        const { container } = render(<LetterRowMarkers letter={baseLetter({ _isCreatedByAgent: true })} />);
        const mark = container.querySelector('[title="Zarejestrowane przez agenta"]') as HTMLElement;
        expect(mark).toBeTruthy();
        expect(mark.style.color).toBe(STEEL_BLUE);
    });

    it("podpowiedź „Dokumentacja zatwierdzona” jest w DOM, nie tylko w SVG", () => {
        // FontAwesomeIcon renderuje `title` jako <title> wewnątrz SVG — atrybut `title`,
        // z którego korzysta przeglądarka, musi siedzieć na opakowaniu.
        const { container } = render(<LetterRowMarkers letter={baseLetter({ addedToApprovedDocumentation: true })} />);
        expect(container.querySelector('[title="Dokumentacja zatwierdzona"]')).toBeTruthy();
    });

    it("nie ma go, gdy pismo założył człowiek", () => {
        const { container } = render(<LetterRowMarkers letter={baseLetter({ _isCreatedByAgent: false })} />);
        expect(container.querySelector('[title="Zarejestrowane przez agenta"]')).toBeNull();
    });

    it("przy autorze linii zdarzenia tylko dla zdarzenia utworzenia", () => {
        const created = baseLetter({ _isCreatedByAgent: true });
        const { container, rerender } = render(<LetterRowContent letter={created} context="contract" />);
        expect(container.querySelector('[title="Wpis założony przez agenta"]')).toBeTruthy();

        // po zatwierdzeniu autorstwo przechodzi na człowieka — flaga zostaje, ale przy
        // nazwisku człowieka nie stawiamy robota
        const approved = baseLetter({
            _isCreatedByAgent: true,
            _lastEvent: {
                id: 2,
                eventType: "APPROVED",
                _lastUpdated: "2026-07-31T09:00:00.000Z",
                _editor: { id: 125, name: "Marek", surname: "Gazda" },
            },
        });
        rerender(<LetterRowContent letter={approved} context="contract" />);
        expect(container.querySelector('[title="Wpis założony przez agenta"]')).toBeNull();
    });
});

describe("LetterRowContent — kontekst ofertowy", () => {
    const offerCase = {
        id: 6905,
        _displayNumber: "S00",
        name: null,
        _type: { id: 101, name: "Pytania" },
        _parent: {
            id: 2548,
            name: "",
            _type: { id: 51, name: "Składanie ofert" },
            _offer: { id: 45, alias: "LSEE - etap 2 (SUW)", employerName: "Gmina Miękinia" },
            _dates: [],
        },
    } as any;

    it("plakietka oferty i zamawiający zamiast kontraktu", () => {
        const letter = baseLetter({ _project: undefined, _cases: [offerCase] });
        render(<LetterRowContent letter={letter} context="offer" />);
        expect(screen.getByTitle("Oferta")).toHaveTextContent("LSEE - etap 2 (SUW)");
        expect(screen.getByText("Gmina Miękinia")).toBeInTheDocument();
    });

    it("nie wywala się na piśmie bez spraw i bez kontraktu", () => {
        const letter = baseLetter({ _project: undefined, _cases: [] });
        const { container } = render(<LetterRowContent letter={letter} context="offer" />);
        expect(within(container).getByText(/Odpowiedź na pismo Wykonawcy/)).toBeInTheDocument();
    });
});
