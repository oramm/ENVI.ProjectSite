/**
 * Testy prezentacyjne wiersza rejestru kontraktów — reguły z zatwierdzonej makiety
 * `tmp/makieta-lista-kontraktow-v3.html`, wariant A („jak w Zadaniach"):
 *  - umowa ENVI prowadzi identyfikatorem `OurId | alias`, nazwa kontraktu jest tytułem;
 *  - umowa wykonawcy prowadzi „hero" `alias · wykonawca`, pod nim `typ · numer ➔ NASZA.UMOWA`;
 *  - brak powiązanej umowy ENVI jest widoczny, a nie pominięty;
 *  - terminy nieobowiązkowe pojawiają się WYŁĄCZNIE gdy wpisane;
 *  - plakietka FIDman tylko przy faktycznie zintegrowanym kontrakcie;
 *  - przeterminowane zakończenie podświetlone, ale nie przy umowie zamkniętej.
 */
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { ContractRowContent } from "./ContractRowContent";

const WARN = "rgb(143, 84, 6)"; // #8f5406 — jsdom normalizuje kolory do rgb()

function ourContract(overrides: any = {}) {
    return {
        id: 1784,
        ourId: "WAW.IK.03",
        alias: "Oczyszczalnia WAW",
        number: "UM/2024/17",
        name: "Pełnienie funkcji Inżyniera Kontraktu",
        status: "W trakcie",
        startDate: "2024-03-01",
        endDate: "2036-12-31",
        _type: { id: 1, name: "IK", isOur: true },
        _project: { id: 74, ourId: "2023.WAW.01" },
        _employers: [{ id: 5, name: "Przedsiębiorstwo Wodociągów Warszawa", shortName: "PWiK Warszawa" }],
        _manager: { id: 1, name: "Jan", surname: "Kowalski" },
        _admin: { id: 2, name: "Anna", surname: "Nowak" },
        ...overrides,
    } as any;
}

function otherContract(overrides: any = {}) {
    return {
        id: 1620,
        number: "12/ZP/2024",
        alias: "Ciąg biologiczny",
        name: "Modernizacja ciągu biologicznego",
        status: "W trakcie",
        startDate: "2024-04-15",
        endDate: "2036-06-30",
        _type: { id: 3, name: "Żółty", isOur: false },
        _project: { id: 74, ourId: "2023.WAW.01" },
        _contractors: [{ id: 9, name: "Budimex S.A.", shortName: "Budimex" }],
        _employers: [{ id: 5, name: "Przedsiębiorstwo Wodociągów Warszawa", shortName: "PWiK Warszawa" }],
        _engineers: [{ id: 7, name: "ENVI Konsulting Sp. z o.o.", shortName: "ENVI Konsulting" }],
        ourIdRelated: "WAW.IK.03",
        ...overrides,
    } as any;
}

describe("ContractRowContent — umowa ENVI", () => {
    it("prowadzi identyfikatorem OurId | alias, a nazwa kontraktu jest tytułem", () => {
        render(<ContractRowContent contract={ourContract()} />);

        expect(screen.getByText("WAW.IK.03 | Oczyszczalnia WAW")).toBeInTheDocument();
        expect(screen.getByText("Pełnienie funkcji Inżyniera Kontraktu")).toBeInTheDocument();
        expect(screen.getByText("2023.WAW.01")).toBeInTheDocument();
    });

    it("pokazuje Zamawiającego skrótem oraz obie osoby prowadzące", () => {
        render(<ContractRowContent contract={ourContract()} />);

        expect(screen.getByText("PWiK Warszawa")).toBeInTheDocument();
        expect(screen.getByText("Jan Kowalski")).toBeInTheDocument();
        expect(screen.getByText("Anna Nowak")).toBeInTheDocument();
    });

    it("radzi sobie bez aliasu — zostaje samo oznaczenie, bez wiszącego separatora", () => {
        render(<ContractRowContent contract={ourContract({ alias: "" })} />);

        expect(screen.getByText("WAW.IK.03")).toBeInTheDocument();
        expect(screen.queryByText(/\|/)).not.toBeInTheDocument();
    });

    it("nie pokazuje strzałki nadzoru — to element wyłącznie umów wykonawców", () => {
        render(<ContractRowContent contract={ourContract()} />);

        expect(screen.queryByText("➔")).not.toBeInTheDocument();
    });
});

describe("ContractRowContent — umowa wykonawcy", () => {
    it("prowadzi hero alias · wykonawca i wskazuje strzałką naszą umowę", () => {
        render(<ContractRowContent contract={otherContract()} />);

        // Hero to jeden element z separatorem w środku, więc sprawdzamy jego całą zawartość —
        // getByText dopasowuje tekst elementu, nie jego fragment.
        expect(screen.getByText("Ciąg biologiczny · Budimex")).toBeInTheDocument();
        expect(screen.getByText(/Żółty · 12\/ZP\/2024/)).toBeInTheDocument();
        expect(screen.getByText("WAW.IK.03")).toBeInTheDocument();
    });

    it("degraduje nazwę kontraktu, gdy hero ma kotwicę", () => {
        render(<ContractRowContent contract={otherContract()} />);

        expect(screen.getByText("Modernizacja ciągu biologicznego")).toBeInTheDocument();
    });

    it("bez aliasu i bez wykonawcy hero przejmuje nazwa, która nie stoi wtedy dwa razy", () => {
        render(<ContractRowContent contract={otherContract({ alias: "", _contractors: [] })} />);

        expect(screen.getAllByText("Modernizacja ciągu biologicznego")).toHaveLength(1);
    });

    it("pokazuje pozostałe strony umowy", () => {
        render(<ContractRowContent contract={otherContract()} />);

        expect(screen.getByText("PWiK Warszawa")).toBeInTheDocument();
        expect(screen.getByText("ENVI Konsulting")).toBeInTheDocument();
    });

    it("sygnalizuje brak powiązanej umowy ENVI zamiast go przemilczeć", () => {
        render(<ContractRowContent contract={otherContract({ ourIdRelated: "", _ourContract: undefined })} />);

        expect(screen.getByText("brak powiązania")).toBeInTheDocument();
    });

    it("nie pokazuje pól osobowych zarezerwowanych dla umów ENVI", () => {
        render(<ContractRowContent contract={otherContract()} />);

        expect(screen.queryByText(/koordynator:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/administrator:/)).not.toBeInTheDocument();
    });
});

describe("ContractRowContent — terminy", () => {
    it("pokazuje wyłącznie terminy obowiązkowe, gdy pozostałe są puste", () => {
        render(<ContractRowContent contract={ourContract()} />);

        expect(screen.getByText("rozpoczęcie")).toBeInTheDocument();
        expect(screen.getByText("zakończenie")).toBeInTheDocument();
        expect(screen.queryByText("gwarancja")).not.toBeInTheDocument();
        expect(screen.queryByText("rękojmia")).not.toBeInTheDocument();
        expect(screen.queryByText("zgł. wad")).not.toBeInTheDocument();
    });

    it("pokazuje terminy nieobowiązkowe, gdy są wpisane, w formacie DD-MM-RRRR", () => {
        render(
            <ContractRowContent
                contract={otherContract({
                    guaranteeEndDate: "2031-06-30",
                    warrantyEndDate: "2031-06-30",
                    defectsNotificationEndDate: "2027-06-30",
                })}
            />
        );

        expect(screen.getByText("gwarancja")).toBeInTheDocument();
        expect(screen.getByText("rękojmia")).toBeInTheDocument();
        expect(screen.getByText("zgł. wad")).toBeInTheDocument();
        expect(screen.getByText("30-06-2027")).toBeInTheDocument();
    });

    it("podświetla zakończenie, gdy termin minął, a umowa nie jest zamknięta", () => {
        render(<ContractRowContent contract={ourContract({ endDate: "2020-01-31" })} />);

        expect(screen.getByText("31-01-2020")).toHaveStyle({ color: WARN });
    });

    it("nie podświetla zakończenia w przeszłości przy umowie zakończonej ani archiwalnej", () => {
        const { rerender } = render(
            <ContractRowContent contract={ourContract({ endDate: "2020-01-31", status: "Zakończony" })} />
        );
        expect(screen.getByText("31-01-2020")).not.toHaveStyle({ color: WARN });

        rerender(<ContractRowContent contract={ourContract({ endDate: "2020-01-31", status: "Archiwalny" })} />);
        expect(screen.getByText("31-01-2020")).not.toHaveStyle({ color: WARN });
    });
});

describe("ContractRowContent — dolny pasek", () => {
    it("pokazuje zakresy przy obu rodzajach kontraktów", () => {
        const ranges = ["Sieć wod-kan", "Przepompownie"];
        const { rerender } = render(
            <ContractRowContent contract={ourContract({ _contractRangesNames: ranges })} />
        );
        expect(screen.getByText("Sieć wod-kan")).toBeInTheDocument();

        rerender(<ContractRowContent contract={otherContract({ _contractRangesNames: ranges })} />);
        expect(screen.getByText("Przepompownie")).toBeInTheDocument();
    });

    // Plakietka pochodzi z CommonComponents (FidmanSyncBadge) — ta sama co w karcie kontraktu,
    // więc szukamy jej po etykiecie tego komponentu, nie po własnym tekście listy.
    it("rysuje plakietkę FIDman dla kontraktu zintegrowanego", () => {
        render(<ContractRowContent contract={otherContract({ _isFidmanIntegrated: true })} />);

        expect(screen.getByText(/FIDman: zsynchronizowano/)).toBeInTheDocument();
    });

    it("nie rysuje plakietki, gdy kontrakt mógłby być zintegrowany, ale nie jest", () => {
        render(<ContractRowContent contract={otherContract({ _isFidmanIntegrated: false })} />);

        expect(screen.queryByText(/FIDman/)).not.toBeInTheDocument();
    });

    it("nie rysuje plakietki dla typu spoza synchronizacji", () => {
        render(<ContractRowContent contract={ourContract()} />);

        expect(screen.queryByText(/FIDman/)).not.toBeInTheDocument();
    });
});
