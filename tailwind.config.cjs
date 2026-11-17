/**
 * Tailwind v3 tylko dla okna Dostepy SB (pierwsze okno PS poza React-Bootstrap).
 * - preflight wylaczony: zadnego resetu globalnego, ekrany Bootstrap sie nie zmieniaja;
 * - important: '#sb-access-admin': kazda klasa Tailwind dziala tylko wewnatrz tego korzenia;
 * - content: tylko ten jeden plik, wiec w paczce trafia tylko to, czego okno uzywa.
 * Gdy kolejne okna przejda na Tailwind, dopisz je do `content` i zmien korzen.
 */
module.exports = {
    content: ['./src/SecondBrain/SbAccessManagePage.tsx'],
    important: '#sb-access-admin',
    corePlugins: { preflight: false },
    theme: { extend: {} },
};
