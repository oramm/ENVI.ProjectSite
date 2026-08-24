import "@testing-library/jest-dom/vitest";

// jsdom nie ma `matchMedia`, a react-bootstrap pyta o nie w Offcanvas (useBreakpoint).
// Stała odpowiedź „nie pasuje" wystarcza: testy sprawdzają zachowanie panelu,
// nie jego zachowanie przy zmianie punktu łamania.
if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
}

// jsdom nie ma przechwytywania wskaźnika, a przeciąganie tła w drzewie typów o nie prosi
// (bez niego ciągnięcie gubiłoby się po wyjściu kursora poza kontener). Zaślepka pusta:
// testy sprawdzają, DOKĄD przesuwa się widok, a nie kto łapie zdarzenia myszy.
if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => undefined;
    Element.prototype.releasePointerCapture = () => undefined;
}
