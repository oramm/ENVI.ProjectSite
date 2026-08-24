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
