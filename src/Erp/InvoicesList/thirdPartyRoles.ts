/**
 * Role podmiotów trzecich faktury (KSeF FA(2), pole `Podmiot3.Rola`).
 *
 * Słownik stał wcześniej wyłącznie w modalu faktury; od chwili, gdy role pokazuje także wiersz
 * listy, mieszka tutaj — kopia rozjechałaby oba widoki przy pierwszej zmianie numeracji.
 */
export const THIRD_PARTY_ROLE_OPTIONS = [
    { value: 1, label: "1 - Faktor" },
    { value: 2, label: "2 - Odbiorca" },
    { value: 3, label: "3 - Podmiot pierwotny" },
    { value: 4, label: "4 - Dodatkowy nabywca" },
    { value: 5, label: "5 - Wystawca faktury" },
    { value: 6, label: "6 - Dokonujący płatności" },
    { value: 7, label: "7 - JST wystawca" },
    { value: 8, label: "8 - JST odbiorca" },
    { value: 9, label: "9 - Członek GV wystawca" },
    { value: 10, label: "10 - Członek GV odbiorca" },
];

/** Sama nazwa roli, bez numeru — do wiersza listy, gdzie numer KSeF nic nie mówi czytającemu. */
export function thirdPartyRoleName(role?: number | null): string {
    if (role === undefined || role === null) return "";
    const option = THIRD_PARTY_ROLE_OPTIONS.find((item) => item.value === role);
    return option ? option.label.split(" - ")[1] : `rola ${role}`;
}
