import { ScrumboardAbsence } from "../../Typings/bussinesTypes";

export const MONTHS_PL_SHORT = [
    "sty", "lut", "mar", "kwi", "maj", "cze",
    "lip", "sie", "wrz", "paź", "lis", "gru",
];

export const MONTHS_PL_LONG = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];

/** 'YYYY-MM-DD' z komponentów (miesiąc 0-indeksowany). */
export function ymd(year: number, month0: number, day: number): string {
    const m = String(month0 + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
}

export function daysInMonth(year: number, month0: number): number {
    return new Date(year, month0 + 1, 0).getDate();
}

/** Dzisiejsza data jako 'YYYY-MM-DD' (czas lokalny). */
export function todayYmd(): string {
    const now = new Date();
    return ymd(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Pozycja pionowego wskaźnika "dziś" w skali roku (procent, środek dnia).
 * Zwraca null, gdy wyświetlany rok nie jest rokiem bieżącym.
 */
export function todayMarkerPct(year: number): number | null {
    const today = todayYmd();
    if (Number(today.slice(0, 4)) !== year) return null;
    const total = daysInYear(year);
    return ((dayOfYear(today) - 0.5) / total) * 100;
}

export function daysInYear(year: number): number {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
}

/** Numer dnia w roku (1..365/366) dla 'YYYY-MM-DD'. */
export function dayOfYear(dateStr: string): number {
    const [y, m, d] = dateStr.split("-").map(Number);
    const start = Date.UTC(y, 0, 1);
    const current = Date.UTC(y, m - 1, d);
    return Math.round((current - start) / 86400000) + 1;
}

/** true dla soboty/niedzieli. */
export function isWeekendYmd(dateStr: string): boolean {
    const [y, m, d] = dateStr.split("-").map(Number);
    const day = new Date(y, m - 1, d).getDay();
    return day === 0 || day === 6;
}

/** Czy data mieści się w zakresie urlopu (porównanie leksykalne 'YYYY-MM-DD'). */
export function absenceCovers(absence: ScrumboardAbsence, dateStr: string): boolean {
    return dateStr >= absence.dateFrom && dateStr <= absence.dateTo;
}

/** Pierwszy urlop pokrywający daną datę (lub undefined). */
export function findAbsenceOn(
    absences: ScrumboardAbsence[],
    dateStr: string
): ScrumboardAbsence | undefined {
    return absences.find((a) => absenceCovers(a, dateStr));
}

/**
 * Pozycja i szerokość paska urlopu w skali roku (procenty), przycięte do roku.
 * Zwraca null gdy urlop nie zachodzi na dany rok.
 */
export function yearBarStyle(
    absence: ScrumboardAbsence,
    year: number
): { leftPct: number; widthPct: number } | null {
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    const from = absence.dateFrom < yearStart ? yearStart : absence.dateFrom;
    const to = absence.dateTo > yearEnd ? yearEnd : absence.dateTo;
    if (to < from) return null;
    const total = daysInYear(year);
    const startDay = dayOfYear(from); // 1..N
    const endDay = dayOfYear(to);
    const leftPct = ((startDay - 1) / total) * 100;
    const widthPct = ((endDay - startDay + 1) / total) * 100;
    return { leftPct, widthPct };
}

/** Pozycje etykiet miesięcy (procent) dla nagłówka rocznego timeline. */
export function monthTicks(year: number): { label: string; leftPct: number }[] {
    const total = daysInYear(year);
    return MONTHS_PL_SHORT.map((label, month0) => ({
        label,
        leftPct: ((dayOfYear(ymd(year, month0, 1)) - 1) / total) * 100,
    }));
}

/* --- Nieobecność na część dnia -------------------------------------------- */

/** Ile minut pracy ma pełny dzień. Ta sama stała co na serwerze (8 h = 1 dzień). */
export const MINUTES_PER_DAY = 480;

/** Minuty od północy dla 'HH:MM'. */
export function timeToMinutes(hhmm: string): number {
    const [hours, minutes] = hhmm.split(":").map(Number);
    return hours * 60 + minutes;
}

/** Długość części dnia w minutach; 0, gdy którejś godziny brakuje. */
export function partialDayMinutes(
    startTime: string | null | undefined,
    endTime: string | null | undefined
): number {
    if (!startTime || !endTime) return 0;
    return timeToMinutes(endTime) - timeToMinutes(startTime);
}

/** Minuty na dni, zaokrąglone tak jak na serwerze (4 h = 0,5 dnia). */
export function minutesToDays(minutes: number): number {
    return Math.round((minutes / MINUTES_PER_DAY) * 100) / 100;
}

/** Liczba po polsku: przecinek, do dwóch miejsc, bez końcowych zer ("1,5", "26"). */
export function formatDays(days: number): string {
    return String(Math.round(days * 100) / 100).replace(".", ",");
}

/** Długość części dnia po ludzku: "4 h", "1,5 h". */
export function formatHours(minutes: number): string {
    return `${formatDays(minutes / 60)} h`;
}

/** Czy nieobecność jest wpisana na część dnia. */
export function isPartialDay(absence: {
    startTime?: string | null;
    endTime?: string | null;
}): boolean {
    return !!absence.startTime && !!absence.endTime;
}

/** Miesiące w dopełniaczu - do dat w zdaniu ("18 września"). */
export const MONTHS_PL_GENITIVE = [
    "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
    "lipca", "sierpnia", "września", "października", "listopada", "grudnia",
];

/** Dzień po ludzku: 'YYYY-MM-DD' → "18 września". */
export function formatDayPl(dateStr: string): string {
    const [, m, d] = dateStr.split("-").map(Number);
    return `${d} ${MONTHS_PL_GENITIVE[m - 1]}`;
}

/**
 * Treść dymka nad nieobecnością.
 *
 * PO CO: wzór dnia częściowego jest DWUSTANOWY - 1 h i 7 h wyglądają identycznie,
 * bo w kratce 26 px różnicy i tak nie widać. Liczbę godzin niesie więc dymek,
 * w obu widokach tak samo. Dla całego dnia dymek zostaje w dotychczasowym kształcie.
 */
export function absenceTooltip(
    absence: {
        _typeName?: string;
        dateFrom: string;
        dateTo: string;
        startTime?: string | null;
        endTime?: string | null;
        workingDaysCount: number;
    },
    withDayCount = false
): string {
    const name = absence._typeName ?? "Nieobecność";
    if (isPartialDay(absence)) {
        const minutes = partialDayMinutes(absence.startTime, absence.endTime);
        return (
            `${name}: ${formatDayPl(absence.dateFrom)}, ` +
            `${absence.startTime}–${absence.endTime} ` +
            `(${formatHours(minutes)} = ${formatDays(minutesToDays(minutes))} dnia)`
        );
    }
    const range = `${absence.dateFrom} – ${absence.dateTo}`;
    return withDayCount
        ? `${name}: ${range} (${formatDays(absence.workingDaysCount)} dni rob.)`
        : `${name}: ${range}`;
}
