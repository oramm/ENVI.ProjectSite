/**
 * Uwaga wiersza zaliczek przy tankowaniu.
 *
 * Arkusz ma jedną kolumnę uwagi, a stan licznika ma być w niej widoczny od razu -
 * dlatego idzie pierwszy, a dopisana ręcznie uwaga za nim (decyzja właściciela).
 * Cyfry grupujemy zwykłą spacją, nie `toLocaleString`: do arkusza ma trafić tekst,
 * który da się później odczytać i przeszukać, a nie spacja nierozdzielająca.
 */
export function fuelNote(odometerReading: string, note: string): string {
    const digits = odometerReading.replace(/\D/g, "");
    const reading = digits ? `licznik ${groupDigits(digits)} km` : "";
    return [reading, note.trim()].filter(Boolean).join(", ");
}

/** "150480" -> "150 480" */
function groupDigits(digits: string): string {
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
