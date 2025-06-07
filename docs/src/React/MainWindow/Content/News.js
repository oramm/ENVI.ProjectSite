"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// News.tsx
const react_1 = __importDefault(require("react"));
const Card_1 = __importDefault(require("react-bootstrap/Card"));
const ListGroup_1 = __importDefault(require("react-bootstrap/ListGroup"));
function News({ title = "Nowości w PS", className, style, items = [
    "[2025-05-26] Karta Nabory: dynamiczne statusy i ikony zgodne z ustawieniami systemu, dane pobierane automatycznie z bazy naborów.",
    "[2025-05-24] Nowe karty na głównym panelu: Oferty, Faktury, Nabory – szybki przegląd i łatwa nawigacja.",
    "[2025-05-24] Wszystkie karty: jednolity wygląd, klikalne nagłówki sekcji, intuicyjne menu akcji po prawej stronie.",
    "[2025-05-24] Statusy i ikonki w kartach zgodne z konfiguracją systemu – łatwo rozpoznasz każdy typ sprawy.",
    "[2025-05-24] Ulepszone ładowanie danych i obsługa pustych list – przejrzyste komunikaty i widoczny wskaźnik ładowania.",
], }) {
    return (react_1.default.createElement(Card_1.default, { className: className, style: style },
        react_1.default.createElement(Card_1.default.Body, null,
            react_1.default.createElement("div", { className: "d-flex justify-content-between align-items-center mb-2" },
                react_1.default.createElement(Card_1.default.Title, { className: "mb-0", style: { fontWeight: 600, fontSize: 18 } }, title)),
            react_1.default.createElement(ListGroup_1.default, { variant: "flush", className: "mt-2" }, items.length === 0 ? (react_1.default.createElement(ListGroup_1.default.Item, { className: "text-secondary" }, "Brak nowo\u015Bci do wy\u015Bwietlenia.")) : (items.map((item, index) => (react_1.default.createElement(ListGroup_1.default.Item, { key: index, className: "border-0 ps-0 pe-0 py-2 d-flex align-items-center" },
                react_1.default.createElement("span", { style: { fontSize: 18, marginRight: 8 } }, "\uD83D\uDCF0"),
                react_1.default.createElement("span", { className: "text-secondary small" }, item)))))))));
}
exports.default = News;
