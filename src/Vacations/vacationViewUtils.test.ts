import { describe, expect, it } from "vitest";
import {
    MINUTES_PER_DAY,
    absenceTooltip,
    formatDayPl,
    formatDays,
    formatHours,
    isPartialDay,
    minutesToDays,
    partialDayMinutes,
    timeToMinutes,
} from "./vacationViewUtils";

describe("część dnia - rachunek taki sam jak na serwerze", () => {
    it("dzień pracy ma 480 minut", () => {
        expect(MINUTES_PER_DAY).toBe(480);
    });

    it("cztery godziny to pół dnia", () => {
        const minutes = partialDayMinutes("08:00", "12:00");
        expect(minutes).toBe(240);
        expect(minutesToDays(minutes)).toBe(0.5);
    });

    it.each([
        ["08:00", "09:00", 60, 0.13],
        ["10:00", "14:00", 240, 0.5],
        ["08:00", "15:59", 479, 1],
    ])("od %s do %s to %i minut i %s dnia", (from, to, minutes, days) => {
        expect(partialDayMinutes(from, to)).toBe(minutes);
        expect(minutesToDays(minutes)).toBe(days);
    });

    it("brak którejś godziny znaczy zero minut, a nie awarię", () => {
        expect(partialDayMinutes(null, "12:00")).toBe(0);
        expect(partialDayMinutes("08:00", undefined)).toBe(0);
        expect(partialDayMinutes(null, null)).toBe(0);
    });

    it("odwrócone godziny dają liczbę ujemną - okno na tej podstawie odmawia zapisu", () => {
        expect(partialDayMinutes("12:00", "08:00")).toBeLessThan(0);
    });

    it("timeToMinutes liczy od północy", () => {
        expect(timeToMinutes("00:00")).toBe(0);
        expect(timeToMinutes("08:30")).toBe(510);
    });
});

describe("rozpoznanie nieobecności godzinowej", () => {
    it("obie godziny wypełnione to część dnia", () => {
        expect(isPartialDay({ startTime: "08:00", endTime: "12:00" })).toBe(true);
    });

    it.each([
        [{ startTime: null, endTime: null }],
        [{ startTime: "08:00", endTime: null }],
        [{}],
    ])("%o to cały dzień", (absence) => {
        expect(isPartialDay(absence)).toBe(false);
    });
});

describe("liczby po polsku", () => {
    it.each([
        [1.5, "1,5"],
        [26, "26"],
        [0.25, "0,25"],
        [0, "0"],
    ])("%s zapisujemy jako %p", (days, text) => {
        expect(formatDays(days)).toBe(text);
    });

    it.each([
        [240, "4 h"],
        [90, "1,5 h"],
        [60, "1 h"],
    ])("%i minut to %p", (minutes, text) => {
        expect(formatHours(minutes)).toBe(text);
    });
});

describe("dymek nad nieobecnością", () => {
    const pelny = {
        _typeName: "Wypoczynkowy",
        dateFrom: "2026-09-23",
        dateTo: "2026-09-25",
        startTime: null,
        endTime: null,
        workingDaysCount: 3,
    };
    const czesciowy = {
        _typeName: "Opieka",
        dateFrom: "2026-09-18",
        dateTo: "2026-09-18",
        startTime: "08:00",
        endTime: "12:00",
        workingDaysCount: 0.5,
    };

    it("część dnia niesie godziny i ułamek dnia - tego wzór nie pokazuje", () => {
        expect(absenceTooltip(czesciowy)).toBe(
            "Opieka: 18 września, 08:00–12:00 (4 h = 0,5 dnia)"
        );
    });

    it("ten sam dymek w obu widokach - liczba dni nic tu nie dokłada", () => {
        expect(absenceTooltip(czesciowy, true)).toBe(absenceTooltip(czesciowy));
    });

    it("cały dzień zostaje w dotychczasowym kształcie", () => {
        expect(absenceTooltip(pelny)).toBe("Wypoczynkowy: 2026-09-23 – 2026-09-25");
        expect(absenceTooltip(pelny, true)).toBe(
            "Wypoczynkowy: 2026-09-23 – 2026-09-25 (3 dni rob.)"
        );
    });

    it("1 h i 7 h różnią się TYLKO dymkiem, bo wzór jest dwustanowy", () => {
        const godzina = { ...czesciowy, endTime: "09:00", workingDaysCount: 0.13 };
        const siedem = { ...czesciowy, endTime: "15:00", workingDaysCount: 0.88 };
        expect(isPartialDay(godzina)).toBe(isPartialDay(siedem));
        expect(absenceTooltip(godzina)).toContain("1 h = 0,13 dnia");
        expect(absenceTooltip(siedem)).toContain("7 h = 0,88 dnia");
    });

    it("liczba dni całego dnia też idzie po polsku", () => {
        expect(absenceTooltip({ ...pelny, workingDaysCount: 1.5 }, true)).toContain(
            "1,5 dni rob."
        );
    });
});

describe("data po polsku", () => {
    it.each([
        ["2026-09-18", "18 września"],
        ["2026-01-01", "1 stycznia"],
        ["2026-12-31", "31 grudnia"],
    ])("%s to %p", (dateStr, text) => {
        expect(formatDayPl(dateStr)).toBe(text);
    });
});
